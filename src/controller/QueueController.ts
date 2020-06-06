import { Context } from "koa";
import QueueService from "../services/QueueService";

const resetQueue = async (ctx: Context) => {
  const { key } = ctx.request.query;
  const queue = await QueueService.getQueue(key);
  await queue.reset(true);
  ctx.body = await queue.list();
};

const listJobs = async (ctx: Context) => {
  const { key } = ctx.request.query;
  ctx.body = await await QueueService.getQueue(key).listInfo();
};

export default { resetQueue, listJobs };
