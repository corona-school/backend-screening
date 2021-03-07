import { JobInfo as GenericJobInfo } from "../GenericQueue";
import { IRawStudent } from "./Student";

export type Status = "waiting" | "active" | "completed" | "rejected";

export type Operation = "addedJob" | "changedStatus" | "removedJob";

export type ScreeningType = "intern" | "instructor" | "tutor" | "projectCoach";

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

export interface StudentData extends IRawStudent {
  jitsi: string;
  subjects: { name: string; grade: { min: number; max: number } }[];
  screeningTypes: ScreeningType[];
}

export interface JobInfo extends StudentData {
  position?: number;
}
