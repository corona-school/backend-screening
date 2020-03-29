import redis, { RedisClient } from "redis";

export type Status = "waiting" | "active" | "completed" | "rejected";

export type Operation = "addedJob" | "changedStatus" | "removedJob";

export interface Message {
  operation: Operation;
  email: string;
  screenerEmail?: string;
}

export interface Job {
  firstname: string;
  lastname: string;
  email: string;
  time: number;
  jitsi: string;
  status: Status;
}
export interface JobInfo extends Job {
  position: number;
}

export default class Queue {
  client: RedisClient;
  publisher: RedisClient;
  private key: string;

  constructor(url: string, key: string) {
    this.client = redis.createClient({ url: url });
    this.publisher = this.client.duplicate();
    this.key = key;
  }

  publish = (
    operation: Operation,
    email: string,
    screenerEmail?: string
  ): void => {
    const message: Message = {
      operation,
      email,
      screenerEmail,
    };
    this.publisher.publish("queue", JSON.stringify(message));
  };

  add = async (job: Job): Promise<JobInfo> => {
    return new Promise((resolve, reject) => {
      this.client.rpush(this.key, JSON.stringify(job), (err) => {
        if (err) {
          return reject(err);
        } else {
          this.getJobWithPosition(job.email)
            .then((jobInfo) => {
              this.publish("addedJob", jobInfo.email);
              resolve(jobInfo);
            })
            .catch((err) => reject(err));
        }
      });
    });
  };

  remove = async (email: string): Promise<boolean> => {
    const currentList = await this.list();

    const job = currentList.find((job) => job.email === email);

    return new Promise((resolve, reject) => {
      if (!job) {
        reject("No job found.");
      }

      this.client.lrem(this.key, 0, JSON.stringify(job), (err) => {
        if (err) {
          return reject(err);
        }
        this.publish("removedJob", job.email);
        return resolve(true);
      });
    });
  };

  getJobWithPosition = async (email: string): Promise<JobInfo | null> => {
    const currentList = await this.list();
    const position: number = currentList.findIndex(
      (job) => job.email === email
    );
    if (position === -1) {
      return null;
    }
    return currentList[position]
      ? { ...currentList[position], position }
      : null;
  };

  changeStatus = async (
    email: string,
    status: Status,
    screenerEmail?: string
  ): Promise<JobInfo> => {
    const { position, ...job } = await this.getJobWithPosition(email);
    job.status = status;
    this.client.lset(this.key, position, JSON.stringify(job));

    this.publish("changedStatus", job.email, screenerEmail);
    return { ...job, position };
  };

  reset = (): Promise<[]> => {
    return new Promise((resolve, reject) => {
      this.client.del(this.key, (err) => {
        if (err) {
          reject("Could not delete list.");
        }
        resolve([]);
      });
    });
  };

  list = (): Promise<Job[]> => {
    return new Promise((resolve, reject) => {
      this.client.lrange(this.key, 0, -1, (err, res) => {
        if (err) {
          reject(err);
        } else {
          const list: Job[] = res.map((job) => JSON.parse(job));
          resolve(list.sort((a, b) => a.time - b.time));
        }
      });
    });
  };

  listInfo = async (): Promise<JobInfo[]> => {
    return new Promise((resolve, reject) => {
      this.list()
        .then((list) => {
          resolve(list.map((job, position) => ({ ...job, position })));
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
