export type Status = "waiting" | "active" | "completed" | "rejected";

export type Operation = "addedJob" | "changedStatus" | "removedJob";

export enum QueueChanges {
  ADDED_JOB = "addedJob",
  REMOVED_JOB = "removedJob",
  CHANGED_STATUS = "changedStatus",
}

export interface Message {
  operation: Operation;
  email: string;
  screenerEmail?: string;
}

export interface ScreenerInfo {
  firstname: string;
  lastname: string;
  email: string;
  time: number;
}

export interface Subject {
  subject: string;
  min: number;
  max: number;
}

export interface Job {
  firstname: string;
  lastname: string;
  email: string;
  subjects: Subject[];
  phone?: string;
  birthday?: Date;
  msg?: string;
  screener?: ScreenerInfo;
  feedback?: string;
  knowcsfrom?: string;
  commentScreener?: string;
  time: number;
  jitsi: string;
  status: Status;
}

export interface JobInfo extends Job {
  position?: number;
}
