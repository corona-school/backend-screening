import crypto from "crypto";
import QueueService from "../services/QueueService";
import { createJob, getId } from "../utils/jobUtils";
import { apiService } from "./backendApiService";
import { IRawStudent, Student } from "../types/Student";

import { JobInfo } from "../GenericQueue";
import { ScreenerInfo, StudentData } from "../types/Queue";
import LoggerService from "../utils/Logger";

export default class ScreeningService {
  login = async (
    id: string,
    key: string
  ): Promise<JobInfo<StudentData, ScreenerInfo>> => {
    const newStudentQueue = await QueueService.getQueue(key);
    const list = await newStudentQueue.listInfo();

    if (list.some((job) => job.id === id)) {
      return list.find((job) => job.id === id);
    }

    return new Promise((resolve, reject) => {
      apiService
        .getUnverifiedStudent(id)
        .then((student: IRawStudent | null) => {
          const id = crypto
            .createHash("md5")
            .update(student.email)
            .digest("hex");

          return newStudentQueue.add(id, createJob(id, student));
        })
        .then((jobInfo: JobInfo<StudentData, ScreenerInfo>) => {
          resolve(jobInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  logout = async (email: string, key: string): Promise<boolean> => {
    try {
      await QueueService.getQueue(key).remove(getId(email));
      return true;
    } catch (err) {
      return false;
    }
  };
}
