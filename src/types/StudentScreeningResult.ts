import { StudentEditableInfoDTO } from "./Student";

export interface IStudentScreeningResult extends StudentEditableInfoDTO {
  screenerEmail: string;
}
