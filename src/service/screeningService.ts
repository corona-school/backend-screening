import { createJob } from "../utils/jobUtils";
import Queue, { JobInfo } from "../queue";
import { apiService } from "./backendApiService";
import { Student } from "../typings/Student";

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
      apiService
        .getUnverifiedStudent(email)
        .then((student: Student | null) => this.myQueue.add(createJob(student)))
        .then((jobInfo: JobInfo) => {
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
