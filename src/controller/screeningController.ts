/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Router from "koa-router";
import passport from "koa-passport";
import { Student } from "../database/models/Student";
import Queue from "../queue";
import { createJob } from "../utils/jobUtils";
import { Screener } from "../database/models/Screener";
import { Next } from "koa";

const router = new Router();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const myQueue = new Queue(REDIS_URL, "StudentQueue");

const requireAuth = async (ctx: any, next: Next) => {
  if (ctx.isAuthenticated()) {
    return next();
  } else {
    ctx.body = { success: false };
    return ctx.throw(401);
  }
};

router.post("/screener/create", async (ctx) => {
  const { firstname, lastname, email, password } = ctx.request.body;

  const screener = await Screener.build({
    firstname,
    lastname,
    email,
    password,
  }).save();

  ctx.body = screener;
});

router.post("/screener/login", async (ctx: any, next) => {
  return passport.authenticate("local", (err, user) => {
    if (!user || err) {
      ctx.body = { success: false };
      ctx.throw(401);
    }
    ctx.body = { success: true };
    return ctx.login(user);
  })(ctx, next);
});

router.get("/screener/logout", (ctx: any) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.redirect("/");
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
});

router.post("/student/login", async (ctx) => {
  const { email } = ctx.request.body;

  const student = await Student.findOne({
    where: {
      email,
    },
  });
  if (student === null) {
    ctx.body = `Could not find a student with email: ${email}`;
    ctx.status = 400;
    return;
  }
  const jobInfo = await myQueue.add(createJob(student));
  if (jobInfo === null) {
    ctx.body = "Could not add job to queue. Please try again later.";
    ctx.status = 500;
    return;
  }
  ctx.body = jobInfo;
});

router.post("/student/logout", async (ctx) => {
  const { email } = ctx.request.body;
  ctx.body = await myQueue.remove(email);
});

router.get("/student/jobInfo", async (ctx) => {
  const { email } = ctx.request.query;
  ctx.body = await myQueue.getJobWithPosition(email);
});

router.post("/student/changeStatus", requireAuth, async (ctx) => {
  const { email, status } = ctx.request.body;
  if (!email || !status) {
    ctx.body = "Could not change status of student.";
    ctx.status = 400;
    return;
  }
  ctx.body = await myQueue.changeStatus(email, status);
});

router.post("/student/complete", requireAuth, async (ctx) => {
  const { email, isVerified } = ctx.request.body;
  if (!email || typeof isVerified !== "boolean") {
    ctx.body = "Could not verify student.";
    ctx.status = 400;
    return;
  }
  ctx.body = await myQueue.changeStatus(
    email,
    isVerified ? "completed" : "rejected"
  );
});

router.post("/queue/reset", requireAuth, async (ctx) => {
  await myQueue.reset();
  ctx.body = await myQueue.list();
});

router.get("/queue/jobs", requireAuth, async (ctx) => {
  ctx.body = await myQueue.listInfo();
});

export default router;
