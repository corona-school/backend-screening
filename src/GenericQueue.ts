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
  key: string;
  private client: Redis.Redis;

  constructor(key: string, redisUrl?: string, options?: Redis.RedisOptions) {
    super();
    this.key = key;
    this.client = new Redis(redisUrl, options);
  }

  disconnect = () => {
    this.client.disconnect();
  };

  publish = (operation: Operation, jobInfo: JobInfo<D, S>): void => {
    const message: Message<D, S> = {
      operation,
      jobInfo,
    };

    this.emit(this.key, JSON.stringify(message));
  };

  add = async (id: string, data: D): Promise<JobInfo<D, S>> => {
    const list = await this.listInfo();

    const duplicateJob = list.find((j) => j.id === id);
    if (duplicateJob) {
      Logger.warn("Found Duplicate Job: " + id);
      return duplicateJob;
    }

    const newJob: Job<D, S> = {
      id,
      data,
      status: "waiting",
      timeWaiting: Date.now(),
    };

    const number = await this.client.rpush(this.key, JSON.stringify(newJob));

    const jobInfo: JobInfo<D, S> = {
      ...newJob,
      position: number - 1,
    };
    this.publish("addedJob", jobInfo);

    return jobInfo;
  };

  remove = async (id: string): Promise<void> => {
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

    const removedItemsCount = await this.client.lrem(
      this.key,
      0,
      JSON.stringify(job)
    );

    this.publish("removedJob", { ...job, position: -1 });
    if (removedItemsCount === 0) {
      throw new Error("Could not delete Item");
    }
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
      throw new Error("Job not found.");
    }
    // check correct actions
    if (action === "SET_ACTIVE" && oldJob.status !== "waiting") {
      throw new Error("Action is incorrect. Job is not waiting.");
    }
    if (action === "SET_DONE" && oldJob.status !== "active") {
      throw new Error("Action is incorrect. Job is not active.");
    }
    if (action === "SET_REJECTED" && oldJob.status !== "active") {
      throw new Error("Action is incorrect. Job is not active.");
    }
    // Don't allow other screeners to screen
    if (
      action === "SET_ACTIVE" &&
      oldJob.assignedTo &&
      oldJob.assignedTo !== assignedTo
    ) {
      throw new Error("Screener is already assigned.");
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
      throw new Error("Job is not in queue");
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
    this.publish("changedStatus", { ...newJob, position: index });
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
      return [];
    }
  };

  listInfo = async (): Promise<JobInfo<D, S>[]> => {
    let k = 0;
    return (await this.list()).map((j) => {
      if (j.status === "waiting") {
        k++;
        return {
          ...j,
          position: k,
        };
      }
      return {
        ...j,
        position: 0,
      };
    });
  };
}
