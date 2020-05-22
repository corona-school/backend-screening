import { Operation, Message, Status } from "./types/Queue";
import LoggerService from "./utils/Logger";
import chalk from "chalk";
import { EventEmitter } from "events";
import Redis from "ioredis";
const Logger = LoggerService("GenericQueue.ts");

export interface Job<D, S> {
  id: string;
  data: D;
  assignedTo?: S;
  status: Status;
  timeWaiting: number;
  timeActive?: number;
  timeDone?: number;
}

export interface JobInfo<D, S> extends Job<D, S> {
  position: number;
}

export default class GenericQueue<D, S> extends EventEmitter {
  private key: string;
  private client: Redis.Redis;

  constructor(key: string, redisUrl: string, options?: Redis.RedisOptions) {
    super();
    this.key = key;
    this.client = new Redis(redisUrl, options);
  }

  publish = (
    operation: Operation,
    id: string,
    screenerEmail?: string
  ): void => {
    const message: Message = {
      operation,
      id,
      screenerEmail,
    };
    console.log("publish", this.key, message);

    this.emit(this.key, JSON.stringify(message));
  };

  add = async (id: string, data: D): Promise<JobInfo<D, S>> => {
    const list = await this.list();

    if (list.some((j) => j.id === id)) {
      Logger.warn("Found Duplicate Job: " + id);
      throw new Error("Duplicate Job.");
    }

    const newJob: Job<D, S> = {
      id,
      data,
      status: "waiting",
      timeWaiting: Date.now(),
    };

    const number = await this.client.rpush(this.key, JSON.stringify(newJob));
    this.publish("addedJob", newJob.id);
    return {
      ...newJob,
      position: number - 1,
    };
  };

  remove = async (id: string): Promise<boolean> => {
    const currentList = await this.list();

    const job = currentList.find((job) => job.id === id);

    if (!job) {
      Logger.warn(
        `Could not remove Job because Job is not in Queue: ${chalk.yellowBright(
          id
        )}`
      );
      throw new Error("Could not remove Job because Job is not in Queue");
    }

    await this.client.lrem(this.key, 0, JSON.stringify(job));
    this.publish("removedJob", id);
    return true;
  };

  getJobWithPosition = async (id: string): Promise<JobInfo<D, S> | null> => {
    const currentList: Job<D, S>[] = await this.listInfo();
    currentList
      .filter((j) => j.status === "waiting")
      .sort((a, b) => a.timeWaiting - b.timeWaiting)
      .forEach((job, index) => {
        if (job.id === id) {
          return {
            ...job,
            index,
          };
        }
      });
    return null;
  };

  changeJob = async (
    id: string,
    data: D,
    assignedTo: S,
    action: string
  ): Promise<JobInfo<D, S> | null> => {
    const list: Job<D, S>[] = await this.list();
    const oldJob = await list.find((j: Job<D, S>) => j.id === id);
    const index = await list.findIndex((j: Job<D, S>) => j.id === id);

    if (!oldJob) {
      Logger.warn(
        `Could not change Job because Job is not in Queue: ${chalk.yellowBright(
          id
        )}`
      );
      return;
    }
    let newJob: Job<D, S> | null = null;
    switch (action) {
      case "SET_ACTIVE": {
        newJob = {
          id: oldJob.id,
          data,
          assignedTo,
          status: "active",
          timeWaiting: oldJob.timeWaiting,
          timeActive: Date.now(),
        };
        break;
      }
      case "SET_DONE": {
        newJob = {
          id: oldJob.id,
          data,
          assignedTo,
          status: "completed",
          timeWaiting: oldJob.timeWaiting,
          timeActive: oldJob.timeActive,
          timeDone: Date.now(),
        };
        break;
      }
      case "SET_REJECTED": {
        newJob = {
          id: oldJob.id,
          data,
          assignedTo,
          status: "rejected",
          timeWaiting: oldJob.timeWaiting,
          timeActive: oldJob.timeActive,
          timeDone: Date.now(),
        };
        break;
      }
    }
    if (!newJob || index === -1) {
      return;
    }
    const jobString: string = JSON.stringify(newJob);

    this.client.lset(this.key, index, jobString);

    Logger.info(
      `Job changed from ${chalk.bgGreenBright(oldJob.status)} -> ${chalk.bgBlue(
        newJob.status
      )} of Student ${chalk.yellowBright(newJob.id)}:`,
      {
        oldJob,
        newJob,
      }
    );
    this.publish(
      "changedStatus",
      JSON.stringify({ ...newJob, position: index })
    );
    return { ...newJob, position: index };
  };

  reset = (hardReset = false): Promise<number> => {
    if (hardReset) {
      return this.client.del(this.key);
    }
    // TODO
  };

  list = async (): Promise<Job<D, S>[]> => {
    try {
      const stringList = await this.client.lrange(this.key, 0, -1);
      const list: Job<D, S>[] = stringList
        .map((s) => JSON.parse(s))
        .sort((a, b) => a.timeWaiting - b.timeWaiting);
      return list;
    } catch (err) {
      Logger.error(err.message);
      return [];
    }
  };

  listInfo = async (): Promise<JobInfo<D, S>[]> => {
    return (await this.list()).map((j, i) => ({
      ...j,
      position: i,
    }));
  };
}
