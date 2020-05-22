import QueueLog from "../database/models/QueueLog";
import LoggerService from "../utils/Logger";
const Logger = LoggerService("statisticService.ts");

export default class StatisticService {
  async getDatabaseQueueLogs(): Promise<QueueLog[] | null> {
    try {
      const logs = await QueueLog.findAll({});
      return logs;
    } catch (e) {
      Logger.info(e);

      return null;
    }
  }
}
