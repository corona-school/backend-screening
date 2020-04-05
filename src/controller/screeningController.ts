/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Router from "koa-router";
import passport from "koa-passport";
import Queue, { Subject, JobInfo } from "../queue";
import { Screener, getScreener } from "../database/models/Screener";
import { Student, getStudent } from "../database/models/Student";
import { Next } from "koa";
import ScreeningService from "../service/screeningService";

const router = new Router();

const myQueue = new Queue("StudentQueue");

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

  try {
    const screener = await Screener.build({
      firstname,
      lastname,
      email,
      password,
    }).save();

    ctx.body = screener;
  } catch (err) {
    console.error(err);
    ctx.body = "Could not create Screener";
    ctx.status = 400;
  }
});

router.get("/screener/status", async (ctx: any) => {
  if (ctx.isAuthenticated()) {
    const from = ctx.session.passport.user;
    const screener: Screener = await getScreener(from);

    ctx.body = {
      firstname: screener.firstname,
      lastname: screener.lastname,
      email: screener.email,
    };
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
});

router.post("/screener/login", async (ctx: any, next) => {
  return passport.authenticate("local", async (err, email) => {
    if (!email || err) {
      ctx.body = { success: false };
      ctx.throw(401);
    }

    const screener: Screener = await getScreener(email);
    ctx.body = {
      firstname: screener.firstname,
      lastname: screener.lastname,
      email: screener.email,
    };
    return ctx.login(email);
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

  const jobInfo: JobInfo = await screeningService.login(email);
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

router.post("/student/remove", requireAuth, async (ctx) => {
  const { email } = ctx.request.body;
  try {
    await myQueue.remove(email);
    ctx.body = "Student Job successfully removed out.";
  } catch (err) {
    console.error(err);
    ctx.body = "Could not remove student.";
    ctx.status = 400;
  }
});

router.get("/student/jobInfo", async (ctx) => {
  const { email } = ctx.request.query;
  ctx.body = await myQueue.getJobWithPosition(email);
});

router.post("/student/changeJob", requireAuth, async (ctx: any) => {
  const job: JobInfo = ctx.request.body;

  if (!job) {
    ctx.body = "Could not change status of student.";
    ctx.status = 400;
    return;
  }
  const from = ctx.session.passport.user;
  const screener: Screener = await getScreener(from);

  if (!screener) {
    ctx.body = "Could not change status of student.";
    ctx.status = 400;
    return;
  }

  const screenerInfo = {
    firstname: screener.firstname,
    lastname: screener.lastname,
    email: screener.email,
    time: Date.now(),
  };

  if (
    job.status === "active" &&
    job.screener &&
    job.screener.email !== screener.email
  ) {
    ctx.status = 400;
    ctx.body = "Ein Screener verifiziert diesen Studenten schon.";
    return;
  }

  if (job.status === "completed" || job.status === "rejected") {
    try {
      const student: Student = await getStudent(job.email);
      student.feedback = job.feedback;
      student.screener = screener.id.toString();
      student.knowsUsFrom = job.knowcsfrom;
      student.commentScreener = job.commentScreener;
      student.subjects = JSON.stringify(
        job.subjects.map((s: Subject) => `${s.subject}${s.min}:${s.max}`)
      );
      student.verified = job.status === "completed" ? true : false;

      await student.save();
    } catch (err) {
      console.error(err);
      console.log("Student Job could not be saved in Database!");
    }
  }

  try {
    ctx.body = await myQueue.changeJob(job.email, job, screenerInfo);
  } catch (err) {
    ctx.status = 400;
    ctx.body = "Something went wrong! ";
    console.error(err);
  }
});

router.get("/screener/info", requireAuth, async (ctx) => {
  const { email } = ctx.request.query;
  const screener = await getScreener(email);
  if (!screener) {
    ctx.body = "Could not find screener.";
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
