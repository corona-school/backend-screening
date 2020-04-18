import Router from "koa-router";
import { studentQueue } from "../server";
import { requireAuth } from "../auth";

const queueRouter = new Router();

queueRouter.post("/queue/reset", requireAuth, async (ctx) => {
  await studentQueue.reset();
  ctx.body = await studentQueue.list();
});

queueRouter.get("/queue/jobs", requireAuth, async (ctx) => {
  ctx.body = await studentQueue.listInfo();
});

export { queueRouter };
