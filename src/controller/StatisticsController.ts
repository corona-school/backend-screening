import StatisticService from "../services/statisticService";
import QueueService from "../services/QueueService";
import { Context } from "koa";

const statisticService = new StatisticService();

const getLogs = async (ctx: Context) => {
  const logs = await statisticService.getDatabaseQueueLogs();

  if (!logs) {
    ctx.body = "Could not find queue logs.";
    ctx.status = 400;
    return;
  }
  ctx.body = logs;
};

const getStatistics = async (ctx: Context) => {
  const { key } = ctx.request.query;
  const list = await QueueService.getQueue(key).listInfo();
  let countCompleted = 0;
  let countRejected = 0;
  list.forEach((j) => {
    if (j.status === "completed") {
      countCompleted++;
    }
    if (j.status === "rejected") {
      countRejected++;
    }
  });
  ctx.body = {
    countCompleted,
    countRejected,
    total: countCompleted + countRejected,
  };
};

export default { getLogs, getStatistics };
