import { Student } from "../database/models/Student";
import { createJob } from "../utils/jobUtils";
import Queue, { JobInfo } from "../queue";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export default class ScreeningService {
  myQueue: Queue;

  constructor() {
    this.myQueue = new Queue(REDIS_URL, "StudentQueue");
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
