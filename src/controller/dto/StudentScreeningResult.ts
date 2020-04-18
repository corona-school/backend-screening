/* eslint-disable @typescript-eslint/interface-name-prefix */
import { JobInfo, Subject } from "../../queue";

export interface IStudentScreeningResult {
  verified: boolean;
  birthday?: Date;
  commentScreener?: string;
  knowscsfrom?: string;
  subjects?: string;
  feedback?: string;
  screenerEmail: string;
}

export const StudentScreeningResult = (
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
