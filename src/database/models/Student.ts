import { Model, Table, Column } from "sequelize-typescript";

@Table({
  timestamps: false,
})
export class Student extends Model<Student> {
  @Column firstname: string;
  @Column lastname: string;
  @Column({ primaryKey: true }) email: string;
  @Column verified: boolean;
  @Column subjects: string[];
  @Column phone: string;
  @Column birthday: Date;
  @Column msg: string;
  @Column screener: string;
  @Column invited: boolean;
  @Column feedback: string;
  @Column({ field: "comment_screener" }) commentScreener: string;
}
