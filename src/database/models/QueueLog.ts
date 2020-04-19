import { Model, Table, Column } from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "queue_log",
})
export default class QueueLog extends Model<QueueLog> {
  @Column({ autoIncrement: true, primaryKey: true }) id: number;
  @Column({ field: "created_at" }) createdAt: string;
  @Column({ field: "finnished_at" }) finnishedAt: string;
  @Column completed: boolean;
  @Column({ field: "screener_email" })
  screenerEmail: string;
  @Column({ field: "student_email" })
  studentEmail: string;
}
