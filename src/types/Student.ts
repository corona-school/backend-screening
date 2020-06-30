export interface Student {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  verified?: boolean;
  subjects: string;
  phone?: string;
  birthday?: Date;
  msg: string;
  feedback?: string;
}

export interface SearchStudent {
  firstname: string;
  lastname: string;
  email: string;
}

export interface IRawStudent2 {
  firstname: string;
  lastname: string;
  email: string;
  subjects: string;
  msg?: string;
  verified: boolean;
  alreadyScreened: boolean;
}

export interface IRawStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subjects: string;
  msg?: string;
  verified: boolean;
  alreadyScreened: boolean;
  phone?: string;
  birthday?: Date;
}

export enum ScreeningStatus {
  Unscreened = "UNSCREENED",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}

export interface ApiScreeningResult {
  verified: boolean;
  phone?: string;
  birthday?: Date;
  commentScreener?: string;
  knowscsfrom?: string;
  screenerEmail: string;
  subjects?: string;
  feedback?: string;
}
export interface Screening {
  id: number;
  success: boolean; //verified or not verified
  comment: string;
  knowsCoronaSchoolFrom: string;
  createdAt: Date;
  updatedAt: Date;
  screener?: any;
  student?: Student;
}
