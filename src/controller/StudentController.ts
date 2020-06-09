import ScreeningService from "../services/screeningService";
import { apiService } from "../services/backendApiService";
import { Screener } from "../types/Screener";
import QueueService from "../services/QueueService";
import { IStudentScreeningResult } from "../types/StudentScreeningResult";
import LoggerService from "../utils/Logger";
import { getId } from "../utils/jobUtils";
import { createStudentScreeningResult } from "../utils/studentScreenResult";
import { StudentData, ScreenerInfo } from "../types/Queue";
import { Context } from "koa";
import Response from "../utils/Response";

const Logger = LoggerService("studentController.ts");

const screeningService = new ScreeningService();

const login = async (ctx: Context) => {
  const { key } = ctx.request.query;
  const { email } = ctx.request.body;

  let jobInfo;
  try {
    jobInfo = await screeningService.login(email, key);
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
};

const logout = async (ctx: Context) => {
  const { key } = ctx.request.query;
  const { email } = ctx.request.body;
  try {
    await screeningService.logout(email, key);
    ctx.body = "Student successfully logged out.";
  } catch (err) {
    ctx.body = "Could not logout student.";
    ctx.status = 400;
  }
};

const remove = async (ctx: Context) => {
  const { key } = ctx.request.query;
  const { email } = ctx.request.body;
  try {
    await QueueService.getQueue(key).remove(getId(email));
    ctx.body = "Student Job successfully removed out.";
  } catch (err) {
    Logger.error(err);
    ctx.body = "Could not remove student.";
    ctx.status = 400;
  }
};

const get = async (ctx: Context) => {
  const { email } = ctx.request.query;

  ctx.body = await apiService.getStudent(email);
};

const getAll = async (ctx: Context) => {
  ctx.body = await apiService.getAllStudents();
};

const getInfo = async (ctx: Context) => {
  try {
    const { email, key } = ctx.request.query;
    ctx.body = await QueueService.getQueue(key).getJobWithPosition(
      getId(email)
    );
  } catch (err) {
    ctx.body = "Not the correct data.";
    ctx.status = 400;
    return;
  }
};

const verify = async (ctx: Context) => {
  const screeningResult: IStudentScreeningResult | null =
    ctx.request.body.screeningResult;
  const studentEmail: string | null = ctx.request.body.studentEmail;

  if (!screeningResult || !studentEmail) {
    ctx.body = "Not the correct data.";
    ctx.status = 400;
    return;
  }

  try {
    await apiService.updateStudent(screeningResult, studentEmail);
    ctx.body = "Screening Result saved.";
    ctx.status = 200;
    return;
  } catch (err) {
    ctx.body = "Could not verify student.";
    ctx.status = 400;
    return;
  }
};

const changeJob = async (ctx: Context) => {
  try {
    const { key } = ctx.request.query;
    const jobData: StudentData = ctx.request.body.data;
    const action: string = ctx.request.body.action;

    if (!jobData) {
      return Response.badRequest(ctx, {
        code: "BAD_REQUEST",
        message: "Please, specify the job data in the body.",
      });
    }
    const from = ctx.session.passport.user;
    const screener: Screener = await apiService.getScreener(from);

    if (!screener) {
      throw new Error("We could not find your account data.");
    }

    const screenerInfo: ScreenerInfo = {
      firstname: screener.firstname,
      lastname: screener.lastname,
      email: screener.email,
    };

    const changedJob = await QueueService.getQueue(key).changeJob(
      jobData.id,
      jobData,
      screenerInfo,
      action
    );

    if (changedJob.status === "completed" || changedJob.status === "rejected") {
      await apiService.updateStudent(
        createStudentScreeningResult(changedJob),
        jobData.email
      );
    }

    ctx.body = changedJob;
  } catch (err) {
    Logger.error(
      `Job could not be changed due to ${err.message}(${err.status})`
    );
    Response.internalServerError(ctx, {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message,
    });
  }
};

export default {
  login,
  logout,
  remove,
  get,
  getAll,
  getInfo,
  verify,
  changeJob,
};
