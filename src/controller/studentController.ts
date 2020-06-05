import ScreeningService from "../services/screeningService";
import { apiService } from "../services/backendApiService";
import { Screener } from "../types/Screener";
import { newStudentQueue } from "../server";
import { IStudentScreeningResult } from "../types/StudentScreeningResult";
import LoggerService from "../utils/Logger";
import { getId } from "../utils/jobUtils";
import { StudentData, ScreenerInfo } from "../types/Queue";
import { Context } from "koa";

const Logger = LoggerService("studentController.ts");

const screeningService = new ScreeningService();

const login = async (ctx: Context) => {
  const { email } = ctx.request.body;

  let jobInfo;
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
};

const logout = async (ctx: Context) => {
  const { email } = ctx.request.body;
  try {
    await screeningService.logout(email);
    ctx.body = "Student successfully logged out.";
  } catch (err) {
    ctx.body = "Could not logout student.";
    ctx.status = 400;
  }
};

const remove = async (ctx: Context) => {
  const { email } = ctx.request.body;
  try {
    await newStudentQueue.remove(getId(email));
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

const getInfo = async (ctx: Context) => {
  const { email } = ctx.request.query;
  ctx.body = await newStudentQueue.getJobWithPosition(getId(email));
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
  const job: StudentData = ctx.request.body.data;
  const action: string = ctx.request.body.action;

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

  const screenerInfo: ScreenerInfo = {
    firstname: screener.firstname,
    lastname: screener.lastname,
    email: screener.email,
  };

  // const oldJob = await newStudentQueue.getJobWithPosition(job.id);
  // if (!oldJob) {
  // 	ctx.body = "Could not change status of student because no oldJob found.";
  // 	ctx.status = 400;
  // 	return;
  // }

  // if (!isValidStatusChange(oldJob.status, job.status)) {
  // 	Logger.warn(
  // 		`Invalid Status change of Job ${job.data.email} from ${oldJob.status} to ${job.status}! Old Screener: ${oldJob.assignedTo?.email} New Screener: ${screenerInfo?.email}`
  // 	);
  // 	ctx.body = "Invalid Status change of Job!";
  // 	ctx.status = 400;
  // 	return;
  // }

  // if (
  // 	job.status === "active" &&
  // 	job.assignedTo &&
  // 	job.assignedTo.email !== screener.email
  // ) {
  // 	ctx.status = 400;
  // 	ctx.body = "Ein Screener verifiziert diesen Studenten schon.";
  // 	return;
  // }

  try {
    ctx.body = await newStudentQueue.changeJob(
      job.id,
      job,
      screenerInfo,
      action
    );
  } catch (err) {
    ctx.status = 400;
    ctx.body = "Something went wrong! ";
    Logger.error(err);
  }
};

export default { login, logout, remove, get, getInfo, verify, changeJob };
