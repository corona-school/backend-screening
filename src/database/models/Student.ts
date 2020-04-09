import { Model, Table, Column } from "sequelize-typescript";

@Table({
  timestamps: false,
})
export class Student extends Model<Student> {
  @Column firstname: string; //Person.firstname
  @Column lastname: string; //Person.lastname
  @Column({ primaryKey: true }) email: string; //Person.email
  @Column verified: boolean; //Student.screening(.success)
  @Column subjects: string; //Student.subjects
  @Column phone: string; //Student.phone
  @Column birthday: Date; //Student.birthday
  @Column msg: string; //Student.msg
  @Column screener: string; //Student.screening.screener(.id?)
  @Column invited: boolean; //?
  @Column feedback: string;//?
  @Column({ field: "comment_screener" }) commentScreener: string; //Student.screening.comment
  @Column({ field: "knowcsfrom" }) knowsUsFrom: string; //Student.screening.knowsCoronaSchoolFrom
}
