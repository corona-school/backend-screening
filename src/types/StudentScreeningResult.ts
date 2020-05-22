export interface IStudentScreeningResult {
  verified: boolean;
  birthday?: Date;
  commentScreener?: string;
  knowscsfrom?: string;
  subjects?: string;
  feedback?: string;
  screenerEmail: string;
}
