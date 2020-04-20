import redis, { RedisClient } from "redis";
import { Operation, Message, Job, JobInfo, ScreenerInfo } from "./models/Queue";
import LoggerService from "./utils/Logger";
const Logger = LoggerService("queue.ts");

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
        Logger.warn("Found Duplicate Job: " + job.email);
        reject("Duplicate Job");
      }
      client.rpush(this.key, JSON.stringify(job), (err) => {
        if (err) {
          Logger.error("Could not add Job to Queue", err);
          return reject(err);
        } else {
          this.getJobWithPosition(job.email)
            .then((jobInfo) => {
              Logger.info("Added new Job: " + jobInfo.email);
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
        Logger.warn("Could not remove Job because Job is not in Queue:", email);
        reject("No job found.");
      }

      client.lrem(this.key, 0, JSON.stringify(job), (err) => {
        if (err) {
          Logger.error("Could not remove Job:", err);
          return reject(err);
        }

        Logger.info("Removed Job: ", email);
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
      Logger.warn("Could not change Job because Job is not in Queue:", email);
      return null;
    }

    const newJob = {
      ...oldJob,
      ...job,
      screener,
    };

    const jobString: string = JSON.stringify(newJob);

    client.lset(this.key, index, jobString);

    Logger.info("Changed Job:", oldJob, newJob);
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
          Logger.error("Could not reset Queue.");
          reject("Could not delete list.");
        }
        Logger.info("Queue was resetted.");
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
