import crypto from "crypto";
import QueueService from "../services/QueueService";
import { createJob, getId } from "../utils/jobUtils";
import { apiService } from "./backendApiService";
import { IRawStudent } from "../types/Student";

import { JobInfo } from "../GenericQueue";
import { ScreenerInfo, StudentData } from "../types/Queue";
import NotVerified from "../errors/client/not-verified";

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
          if (student.verifiedAt == null) {
            throw new NotVerified(
              "Student tried to log in with email address that is not verified!"
            );
          }
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
