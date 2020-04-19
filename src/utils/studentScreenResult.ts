import { IStudentScreeningResult } from "../models/StudentScreeningResult";
import { JobInfo, Subject } from "../models/Queue";

export const createStudentScreeningResult = (
  job: JobInfo
): IStudentScreeningResult => ({
  verified: job.status === "completed",
  birthday: job.birthday,
  commentScreener: job.commentScreener,
  knowscsfrom: job.knowcsfrom,
  subjects: JSON.stringify(
    job.subjects.map((s: Subject) => `${s.subject}${s.min}:${s.max}`)
  ),
  feedback: job.feedback,
  screenerEmail: job.screener.email,
});
