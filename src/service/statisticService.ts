import Queue from "../queue";
import QueueLog from "../database/models/QueueLog";

export default class StatisticService {
  myQueue: Queue;

  constructor(queue: Queue) {
    this.myQueue = queue;
  }

  async getDatabaseQueueLogs(): Promise<QueueLog[] | null> {
    try {
      const logs = await QueueLog.findAll({});
      return logs;
    } catch (e) {
      console.log(e);

      return null;
    }
  }
}
