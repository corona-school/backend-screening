import { Student } from "../database/models/Student";
import { createJob } from "../utils/jobUtils";
import Queue, { JobInfo } from "../queue";

export default class ScreeningService {
  myQueue: Queue;

  constructor() {
    this.myQueue = new Queue("StudentQueue");
  }

  login = async (email: string): Promise<JobInfo> => {
    const list = await this.myQueue.listInfo();

    if (list.some((job) => job.email === email)) {
      return list.find((job) => job.email === email);
    }

    return new Promise((resolve, reject) => {
      Student.findOne({
        where: {
          email,
          verified: false,
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

  logout = async (email: string): Promise<boolean> => {
    return this.myQueue.remove(email);
  };
}
