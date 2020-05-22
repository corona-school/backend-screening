import { newStudentQueue } from "../server";
import { Context } from "koa";

const resetQueue = async (ctx: any) => {
  await newStudentQueue.reset(true);
  ctx.body = await newStudentQueue.list();
};

const listJobs = async (ctx: any) => {
  ctx.body = await newStudentQueue.listInfo();
};

export default { resetQueue, listJobs };
