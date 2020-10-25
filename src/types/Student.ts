export interface StudentEditableInfo {
  isTutor: boolean;
  isInstructor: boolean;
  isProjectCoach: boolean;
  screenings: {
    tutor?: ScreeningInfo;
    instructor?: ScreeningInfo;
    projectCoach?: ScreeningInfo;
  };
  projectFields: ProjectFieldWithGradeInfoType[];
  subjects: Subject[];
  feedback?: string;
  phone?: string;
  newsletter: boolean;
  msg?: string;
  university?: string;
  state?: string;
  isUniversityStudent?: boolean;
  official?: {
    hours: number;
    module: string;
  };
}

export interface ProjectFieldWithGradeInfoType {
  name: string;
  min?: number;
  max?: number;
}

export interface Subject {
  name: string;
  gradeInfo?: {
    min: number;
    max: number;
  };
}

export interface ScreeningInfo {
  verified: boolean;
  comment?: string;
  knowsCoronaSchoolFrom?: string;
}

export interface IRawStudent extends StudentEditableInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ScreeningResult extends StudentEditableInfo {
  screenerEmail: string;
}

export interface SearchStudent {
  firstname: string;
  lastname: string;
  email: string;
}

export enum ScreeningStatus {
  Unscreened = "UNSCREENED",
  Accepted = "ACCEPTED",
  Rejected = "REJECTED",
}
