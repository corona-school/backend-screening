import Router from "koa-router";
import { requireAuth } from "../auth";
import ScreeningService from "../service/screeningService";
import { apiService } from "../api/backendApiService";
import { Screener } from "../models/Screener";
import { createStudentScreeningResult } from "../utils/studentScreenResult";
import { studentQueue } from "../server";
import { JobInfo } from "../models/Queue";
import LoggerService from "../utils/Logger";
const Logger = LoggerService("studentController.ts");

const studentRouter = new Router();

const screeningService = new ScreeningService();

studentRouter.post("/student/login", async (ctx) => {
  const { email } = ctx.request.body;

  let jobInfo: JobInfo;
  try {
    jobInfo = await screeningService.login(email);
  } catch (e) {
    ctx.body = "Could not login the student: " + e;
    ctx.status = 400;
    return;
  }
  if (!jobInfo) {
    ctx.body = "Could not login the student.";
    ctx.status = 400;
    return;
  }
  ctx.body = jobInfo;
});

studentRouter.post("/student/logout", async (ctx) => {
  const { email } = ctx.request.body;
  try {
    await screeningService.logout(email);
    ctx.body = "Student successfully logged out.";
  } catch (err) {
    ctx.body = "Could not logout student.";
    ctx.status = 400;
  }
});

studentRouter.post("/student/remove", requireAuth, async (ctx) => {
  const { email } = ctx.request.body;
  try {
    await studentQueue.remove(email);
    ctx.body = "Student Job successfully removed out.";
  } catch (err) {
    Logger.error(err);
    ctx.body = "Could not remove student.";
    ctx.status = 400;
  }
});

studentRouter.get("/student/jobInfo", async (ctx) => {
  const { email } = ctx.request.query;
  ctx.body = await studentQueue.getJobWithPosition(email);
});

studentRouter.post("/student/changeJob", requireAuth, async (ctx: any) => {
  const job: JobInfo = ctx.request.body;

  if (!job) {
    ctx.body = "Could not change status of student.";
    ctx.status = 400;
    return;
  }
  const from = ctx.session.passport.user;
  const screener: Screener = await apiService.getScreener(from);

  if (!screener) {
    ctx.body = "Could not change status of student.";
    ctx.status = 400;
    return;
  }

  const screenerInfo = {
    id: screener.id,
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
      await apiService.updateStudent(
        createStudentScreeningResult(job),
        job.email
      );
    } catch (err) {
      Logger.error(err);
      Logger.info("Student data could not be updated!");
    }
  }

  try {
    ctx.body = await studentQueue.changeJob(job.email, job, screenerInfo);
  } catch (err) {
    ctx.status = 400;
    ctx.body = "Something went wrong! ";
    Logger.error(err);
  }
});

export { studentRouter };
