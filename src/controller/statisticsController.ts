import { newStudentQueue } from "../server";
import StatisticService from "../services/statisticService";
import { Context } from "koa";

const statisticService = new StatisticService();

const getLogs = async (ctx: any) => {
  const logs = await statisticService.getDatabaseQueueLogs();

  if (!logs) {
    ctx.body = "Could not find queue logs.";
    ctx.status = 400;
    return;
  }
  ctx.body = logs;
};

const getStatistics = async (ctx: any) => {
  const list = await newStudentQueue.listInfo();
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
