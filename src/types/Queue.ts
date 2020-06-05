import { JobInfo as GenericJobInfo } from "../GenericQueue";

export type Status = "waiting" | "active" | "completed" | "rejected";

export type Operation = "addedJob" | "changedStatus" | "removedJob";

export enum QueueChanges {
  ADDED_JOB = "addedJob",
  REMOVED_JOB = "removedJob",
  CHANGED_STATUS = "changedStatus",
}

export interface Message<D, S> {
  operation: Operation;
  jobInfo: GenericJobInfo<D, S>;
}

export interface ScreenerInfo {
  firstname: string;
  lastname: string;
  email: string;
}

export interface Subject {
  subject: string;
  min: number;
  max: number;
}

export interface StudentData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  subjects: Subject[];
  phone?: string;
  msg?: string;
  feedback?: string;
  knowcsfrom?: string;
  commentScreener?: string;
  jitsi: string;
}

export interface JobInfo extends StudentData {
  position?: number;
}
