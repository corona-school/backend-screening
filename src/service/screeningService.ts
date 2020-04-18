import { createJob } from "../utils/jobUtils";
import Queue, { JobInfo } from "../queue";
import BackendApiService from "./backendApiService";
import { Student } from "../typings/Student";

export default class ScreeningService {
  myQueue: Queue;
  apiService: BackendApiService;

  constructor() {
    this.myQueue = new Queue("StudentQueue");
    this.apiService = new BackendApiService();
  }

  login = async (email: string): Promise<JobInfo> => {
    const list = await this.myQueue.listInfo();

    if (list.some((job) => job.email === email)) {
      return list.find((job) => job.email === email);
    }

    return new Promise((resolve, reject) => {
      this.apiService
        .getUnverifiedStudent(email)
        .then((student: Student | null) => this.myQueue.add(createJob(student)))
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
