import { createJob } from "../utils/jobUtils";
import { JobInfo } from "../queue";
import { apiService } from "../api/backendApiService";
import { Student } from "../models/Student";
import { studentQueue } from "../server";

export default class ScreeningService {
  login = async (email: string): Promise<JobInfo> => {
    const list = await studentQueue.listInfo();

    if (list.some((job) => job.email === email)) {
      return list.find((job) => job.email === email);
    }

    return new Promise((resolve, reject) => {
      apiService
        .getUnverifiedStudent(email)
        .then((student: Student | null) => studentQueue.add(createJob(student)))
        .then((jobInfo: JobInfo) => {
          resolve(jobInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  logout = async (email: string): Promise<boolean> => {
    return studentQueue.remove(email);
  };
}
