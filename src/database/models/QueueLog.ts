import { Model, Table, Column } from "sequelize-typescript";
import LoggerService from "../../utils/Logger";
import { JobInfo } from "../../types/Queue";
const Logger = LoggerService("QueueLog.ts");

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

export const saveJobInQueueLog = async (job: JobInfo) => {
  if (job.status !== "completed" && job.status !== "rejected") {
    return;
  }

  try {
    const log = await QueueLog.findOne({
      where: {
        screenerEmail: job.screener.email,
        studentEmail: job.email,
      },
    });
    if (log) {
      Logger.warn(`Duplicate QueueLog for ${job.email}`);
      return;
    }
    const queue = new QueueLog({
      createdAt: new Date(job.time).toISOString(),
      finnishedAt: new Date(job.screener.time).toISOString(),
      completed: job.status === "completed",
      screenerEmail: job.screener.email,
      studentEmail: job.email,
    });
    await queue.save();
    Logger.info(`Saved QueueLog for ${job.email}`);
  } catch (e) {
    Logger.error(
      `Could not save QueueLog for ${job.email}: ${e.name}-${e.original.messageDetail}`
    );
  }
};
