import { Student } from "../database/models/Student";
import { createJob } from "../utils/jobUtils";
import Queue, { JobInfo } from "../queue";
import { RedisClient } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export default class ScreeningService {
  myQueue: Queue;
  subcriber: RedisClient;

  constructor() {
    this.myQueue = new Queue(REDIS_URL, "StudentQueue");
    this.subcriber = this.myQueue.client.duplicate();
    this.subcriber.subscribe("queue");
  }

  login = async (email: string): Promise<JobInfo> => {
    return new Promise((resolve, reject) => {
      Student.findOne({
        where: {
          email,
        },
      })
        .then((student) => {
          return this.myQueue.add(createJob(student));
        })
        .then((jobInfo) => {
          resolve(jobInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
}
