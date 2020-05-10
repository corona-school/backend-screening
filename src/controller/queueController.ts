import Router from "koa-router";
import { newStudentQueue } from "../server";
import { requireAuth } from "../auth";

const queueRouter = new Router();

queueRouter.post("/queue/reset", requireAuth, async (ctx) => {
  await newStudentQueue.reset(true);
  ctx.body = await newStudentQueue.list();
});

queueRouter.get("/queue/jobs", requireAuth, async (ctx) => {
  ctx.body = await newStudentQueue.listInfo();
});

export { queueRouter };
