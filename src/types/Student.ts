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

export interface StudentEditableInfoDTO {
  email: string;
  isTutor: boolean;
  isInstructor: boolean;
  isProjectCoach: boolean;
  screenings: {
    tutor?: ScreeningInfo;
    instructor?: ScreeningInfo;
    projectCoach?: ScreeningInfo;
  };
  projectFields: ProjectFieldWithGradeInfoType[];
  subjects: StudentSubject[];
  feedback?: string;
  phone?: string;
  newsletter: boolean;
  msg?: string;
  university?: string;
  state?: string;
  isUniversityStudent?: boolean;
  jufoPastParticipationConfirmed?: boolean;
  wasJufoParticipant?: string;
  hasJufoCertificate?: boolean;
  jufoPastParticipationInfo?: string;
  verifiedAt: Date;
  official?: {
    hours: number;
    module: string;
  };
}

export interface IRawStudent extends StudentEditableInfoDTO {
  id: string;
  firstName: string;
  lastName: string;
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

export interface ScreeningInfo {
  verified: boolean;
  comment?: string;
  knowsCoronaSchoolFrom?: string;
}

export interface ProjectFieldWithGradeInfoType {
  name: string;
  min?: number;
  max?: number;
}

export interface StudentSubject {
  name: string;
  grade?: {
    min: number;
    max: number;
  };
}
