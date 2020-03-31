/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Router from "koa-router";
import passport from "koa-passport";
import Queue from "../queue";
import { Screener } from "../database/models/Screener";
import { Next } from "koa";
import ScreeningService from "../service/screeningService";
import bcrypt from "bcrypt";

const router = new Router();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const myQueue = new Queue(REDIS_URL, "StudentQueue");

const requireAuth = async (ctx: any, next: Next) => {
  if (ctx.isAuthenticated()) {
    return next();
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
};

router.post("/screener/create", async (ctx) => {
  const { firstname, lastname, email, password } = ctx.request.body;
  const hash = await bcrypt.hash(password, 10);
  const screener = await Screener.build({
    firstname,
    lastname,
    email,
    password: hash,
  }).save();

  ctx.body = screener;
});

router.get("/screener/status", async (ctx: any) => {
  if (ctx.isAuthenticated()) {
    ctx.body = { success: true };
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
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

const screeningService = new ScreeningService();

router.post("/student/login", async (ctx) => {
  const { email } = ctx.request.body;

  const jobInfo = await screeningService.login(email);
  if (!jobInfo) {
    ctx.body = "Could not login the student.";
    ctx.status = 400;
    return;
  }
  ctx.body = jobInfo;
});

router.post("/student/logout", async (ctx) => {
  const { email } = ctx.request.body;
  try {
    await screeningService.logout(email);
    ctx.body = "Student successfully logged out.";
  } catch (err) {
    ctx.body = "Could not logout student.";
    ctx.status = 400;
  }
});

router.get("/student/jobInfo", async (ctx) => {
  const { email } = ctx.request.query;
  ctx.body = await myQueue.getJobWithPosition(email);
});

router.post("/student/changeStatus", requireAuth, async (ctx: any) => {
  const { email, status } = ctx.request.body;
  if (!email || !status) {
    ctx.body = "Could not change status of student.";
    ctx.status = 400;
    return;
  }
  const from = ctx.session.passport.user;

  ctx.body = await myQueue.changeStatus(email, status, from);
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

router.get("/screener/info", requireAuth, async (ctx) => {
  const { email } = ctx.request.query;
  const screener = await Screener.findOne({
    where: {
      email,
    },
  });
  if (!screener) {
    ctx.body = "Could not find screenre";
    ctx.status = 400;
    return;
  }
  ctx.body = screener;
});

router.post("/queue/reset", requireAuth, async (ctx) => {
  await myQueue.reset();
  ctx.body = await myQueue.list();
});

router.get("/queue/jobs", requireAuth, async (ctx) => {
  ctx.body = await myQueue.listInfo();
});

export default router;
