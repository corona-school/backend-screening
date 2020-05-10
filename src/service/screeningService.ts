import crypto from "crypto";
import { createJob, getId } from "../utils/jobUtils";
import { apiService } from "../api/backendApiService";
import { Student } from "../models/Student";
import { newStudentQueue } from "../server";
import { JobInfo } from "../GenericQueue";
import { ScreenerInfo, StudentData } from "../models/Queue";

export default class ScreeningService {
  login = async (id: string): Promise<JobInfo<StudentData, ScreenerInfo>> => {
    const list = await newStudentQueue.listInfo();

    if (list.some((job) => job.id === id)) {
      return list.find((job) => job.id === id);
    }

    return new Promise((resolve, reject) => {
      apiService
        .getUnverifiedStudent(id)
        .then((student: Student | null) => {
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

  logout = async (email: string): Promise<boolean> => {
    return newStudentQueue.remove(getId(email));
  };
}
