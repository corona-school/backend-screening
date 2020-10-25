import crypto from "crypto";
import { StudentData, Status, Subject } from "../types/Queue";
import { IRawStudent, StudentSubject } from "../types/Student";
import LoggerService from "../utils/Logger";
import { IStudentScreeningResult } from "../types/StudentScreeningResult";

const Logger = LoggerService("jobUtils.ts");

export const getId = (email: string) =>
  crypto.createHash("md5").update(email).digest("hex");

const ParseSubjects = (rawSubjects: StudentSubject[]): Subject[] => {
  let subjects: Subject[] = [];
  try {
    subjects = rawSubjects.map((s: StudentSubject) => {
      return {
        subject: s.name,
        min: s.gradeInfo.min,
        max: s.gradeInfo.max,
      };
    });
  } catch (err) {
    Logger.info("Cannot parse");
  }
  return subjects;
};

export const createJob = (id: string, student: IRawStudent): StudentData => {
  const subjects = ParseSubjects(student.subjects);

  return {
    id,
    firstname: student.firstName,
    lastname: student.lastName,
    email: student.email,
    subjects: subjects,
    phone: student.phone,
    knowcsfrom: "",
    msg: student.msg,
    feedback: student.feedback,
    commentScreener: "",
    jitsi: `https://meet.jit.si/${id}`,
  };
};

export const updateJob = (
  oldData: StudentData,
  screeningResult: IStudentScreeningResult
): StudentData => {
  const subjects = ParseSubjects(screeningResult.subjects);

  return {
    id: oldData.id,
    firstname: oldData.firstname,
    lastname: oldData.lastname,
    email: oldData.email,
    subjects: subjects,
    phone: screeningResult.phone,
    knowcsfrom: oldData.knowcsfrom,
    msg: screeningResult.msg,
    feedback: screeningResult.feedback,
    commentScreener: oldData.commentScreener,
    jitsi: oldData.jitsi,
  };
};

export const isValidStatusChange = (
  oldStatus: Status,
  newStatus: Status
): boolean => {
  if (oldStatus === "active" && newStatus === "waiting") {
    return false;
  }
  if (oldStatus === "completed" && newStatus === "active") {
    return false;
  }
  if (oldStatus === "rejected" && newStatus === "active") {
    return false;
  }
  if (oldStatus === "completed" && newStatus === "waiting") {
    return false;
  }
  if (oldStatus === "rejected" && newStatus === "waiting") {
    return false;
  }
  if (oldStatus === "waiting" && newStatus === "completed") {
    return false;
  }

  return true;
};

export const isValidScreenerChange = (
  oldJob: Partial<StudentData>,
  newJob: StudentData
) => {
  // if (!oldJob.screener) {
  // 	return true;
  // }
  // if (!newJob.screener) {
  // 	return false;
  // }
  // if (oldJob.screener.email === newJob.screener.email) {
  // 	return true;
  // }
  // if (oldJob.status !== "waiting" || newJob.status !== "waiting") {
  // 	return false;
  // }

  return true;
};
