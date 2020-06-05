import { newStudentQueue } from "../server";
import { Context } from "koa";

const resetQueue = async (ctx: Context) => {
  await newStudentQueue.reset(true);
  ctx.body = await newStudentQueue.list();
};

const listJobs = async (ctx: Context) => {
  ctx.body = await newStudentQueue.listInfo();
};

export default { resetQueue, listJobs };
