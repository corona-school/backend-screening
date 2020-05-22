import { Model, Table, Column } from "sequelize-typescript";
import LoggerService from "../../utils/Logger";
import { JobInfo } from "../../GenericQueue";
import { StudentData, ScreenerInfo } from "../../types/Queue";

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

export const saveJobInQueueLog = async (
  job: JobInfo<StudentData, ScreenerInfo>
) => {
  if (job.status !== "completed" && job.status !== "rejected") {
    return;
  }

  try {
    const log = await QueueLog.findOne({
      where: {
        screenerEmail: job.assignedTo.email,
        studentEmail: job.data.email,
      },
    });
    if (log) {
      Logger.warn(`Duplicate QueueLog for ${job.data.email}`);
      return;
    }
    const queue = new QueueLog({
      createdAt: new Date(job.timeWaiting).toISOString(),
      finnishedAt: new Date(job.timeDone).toISOString(),
      completed: job.status === "completed",
      screenerEmail: job.assignedTo.email,
      studentEmail: job.data.email,
    });
    await queue.save();
    Logger.info(`Saved QueueLog for ${job.data.email}`);
  } catch (e) {
    Logger.error(
      `Could not save QueueLog for ${job.data.email}: ${e.name}-${e.original.messageDetail}`
    );
  }
};
