import {
  Model,
  Table,
  Column,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Screener } from "./Screener";
import { Student } from "./Student";

@Table({
  timestamps: false,
  tableName: "queue_log",
})
export default class QueueLog extends Model<QueueLog> {
  @Column({ autoIncrement: true, primaryKey: true }) id: number;
  @Column({ field: "created_at" }) createdAt: string;
  @Column({ field: "finnished_at" }) finnishedAt: string;
  @Column completed: boolean;

  @ForeignKey(() => Screener)
  @Column({ field: "screener_email" })
  screenerEmail: string;
  @BelongsTo(() => Screener, { targetKey: "email" }) screener: Screener;

  @ForeignKey(() => Student)
  @Column({ field: "student_email" })
  studentEmail: string;
  @BelongsTo(() => Student) student: Student;
}
