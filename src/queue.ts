import redis, { RedisClient } from "redis";

export type Status = "waiting" | "active" | "completed" | "rejected";

export type Operation = "addedJob" | "changedStatus" | "removedJob";

export interface Message {
  operation: Operation;
  email: string;
  screenerEmail?: string;
}

export interface ScreenerInfo {
  firstname: string;
  lastname: string;
  email: string;
  time: number;
}

export interface Subject {
  subject: string;
  min: number;
  max: number;
}

export interface Job {
  firstname: string;
  lastname: string;
  email: string;
  subjects: Subject[];
  phone?: string;
  birthday?: Date;
  msg?: string;
  screener?: ScreenerInfo;
  invited?: boolean;
  feedback?: string;
  knowcsfrom?: string;
  commentScreener?: string;
  time: number;
  jitsi: string;
  status: Status;
}

export interface JobInfo extends Job {
  position?: number;
}
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const client = redis.createClient({ url: REDIS_URL });
const publisher = client.duplicate();

export default class Queue {
  private key: string;

  constructor(key: string) {
    this.key = key;
  }

  getClient(): RedisClient {
    return client;
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

    publisher.publish("queue", JSON.stringify(message));
  };

  add = async (job: Job): Promise<JobInfo> => {
    const list = await this.list();

    return new Promise((resolve, reject) => {
      if (list.some((j) => j.email === job.email)) {
        reject("Duplicate Job");
      }
      client.rpush(this.key, JSON.stringify(job), (err) => {
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

      client.lrem(this.key, 0, JSON.stringify(job), (err) => {
        if (err) {
          return reject(err);
        }

        this.publish("removedJob", email);
        return resolve(true);
      });
    });
  };

  getJobWithPosition = async (email: string): Promise<JobInfo | null> => {
    const currentList = await this.listInfo();

    const job: JobInfo | null = currentList.find((job) => job.email === email);
    if (!job) {
      return null;
    }
    return job;
  };

  changeJob = async (
    email: string,
    job: Partial<Job>,
    screener: ScreenerInfo
  ): Promise<JobInfo | null> => {
    const oldJob = await this.getJobWithPosition(email);
    const list = await this.list();
    const index = list.findIndex((j) => j.email === oldJob.email);

    if (index === -1) {
      return null;
    }

    client.lset(
      this.key,
      index,
      JSON.stringify({ ...oldJob, ...job, screener })
    );

    this.publish("changedStatus", job.email, screener.email);
    return {
      ...oldJob,
      ...job,
      screener,
    };
  };

  reset = (): Promise<[]> => {
    return new Promise((resolve, reject) => {
      client.del(this.key, (err) => {
        if (err) {
          reject("Could not delete list.");
        }
        resolve([]);
      });
    });
  };

  list = (): Promise<Job[]> => {
    return new Promise((resolve, reject) => {
      client.lrange(this.key, 0, -1, (err, res) => {
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
      let position = 0;
      this.list()
        .then((list) => {
          resolve(
            list.map((job) => {
              if (job.status === "waiting") {
                position += 1;
                return { ...job, position };
              }
              return job;
            })
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
