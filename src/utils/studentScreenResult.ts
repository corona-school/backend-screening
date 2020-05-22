import { IStudentScreeningResult } from "../types/StudentScreeningResult";
import { JobInfo } from "../GenericQueue";
import { Subject, StudentData, ScreenerInfo } from "../types/Queue";

export const createStudentScreeningResult = (
  job: JobInfo<StudentData, ScreenerInfo>
): IStudentScreeningResult => ({
  verified: job.status === "completed",
  commentScreener: job.data.commentScreener,
  knowscsfrom: job.data.knowcsfrom,
  subjects: JSON.stringify(
    job.data.subjects.map((s: Subject) => `${s.subject}${s.min}:${s.max}`)
  ),
  feedback: job.data.feedback,
  screenerEmail: job.assignedTo.email,
});
