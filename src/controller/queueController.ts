import Router from "koa-router";
import { requireAuth } from "./auth";
import { studentQueue } from "../server";

const queueRouter = new Router();

queueRouter.post("/queue/reset", requireAuth, async (ctx) => {
  await studentQueue.reset();
  ctx.body = await studentQueue.list();
});

queueRouter.get("/queue/jobs", requireAuth, async (ctx) => {
  ctx.body = await studentQueue.listInfo();
});

export { queueRouter };
