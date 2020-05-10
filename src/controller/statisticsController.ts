import Router from "koa-router";
import { requireAuth } from "../auth";
import { newStudentQueue } from "../server";
import StatisticService from "../service/statisticService";

const statisticsRouter = new Router();

const statisticService = new StatisticService();

statisticsRouter.get("/statistics/logs", requireAuth, async (ctx) => {
  const logs = await statisticService.getDatabaseQueueLogs();

  if (!logs) {
    ctx.body = "Could not find queue logs.";
    ctx.status = 400;
    return;
  }
  ctx.body = logs;
});

statisticsRouter.get("/queue/statistics", async (ctx) => {
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
});

export { statisticsRouter };
