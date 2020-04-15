import {JobInfo, Subject} from '../../queue';

export class StudentScreeningResult {
  verified: boolean;
  birthday?: Date;
  commentScreener?: string;
  knowscsfrom?: string;
  screenerEmail: string;
  subjects?: string;
  feedback?: string;

  constructor(job: JobInfo) {
    this.verified = job.status === "completed";
    this.birthday = job.birthday;
    this.commentScreener = job.commentScreener;
    this.knowscsfrom = job.knowcsfrom;
    this.screenerEmail = job.screener.email;
    this.subjects = JSON.stringify(job.subjects.map((s: Subject) => `${s.subject}${s.min}:${s.max}`));
    this.feedback = job.feedback;
  }
}
