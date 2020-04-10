import Queue from "../queue";
import QueueLog from "../database/models/QueueLog";
import { Screener } from "../database/models/Screener";
import { Student } from "../database/models/Student";

export default class StatisticService {
  myQueue: Queue;

  constructor(queue: Queue) {
    this.myQueue = queue;
  }

  async getDatabaseQueueLogs(): Promise<QueueLog[] | null> {
    try {
      const logs = await QueueLog.findAll({
        include: [Screener, Student],
      });
      return logs;
    } catch (e) {
      console.log(e);

      return null;
    }
  }
}
