import LoggerService from "../utils/Logger";
const Logger = LoggerService("statisticService.ts");

export default class StatisticService {
  async getDatabaseQueueLogs(): Promise<any[] | null> {
    try {
      return [];
    } catch (e) {
      Logger.info(e);

      return null;
    }
  }
}
