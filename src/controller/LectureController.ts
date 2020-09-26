import { Context } from "koa";
import { Lecture } from "../types/Lecture";
import { apiService } from "../services/backendApiService";
import LoggerService from "../utils/Logger";

const Logger = LoggerService("LectureController.ts");

export async function postLecture(ctx: Context) {
  try {
    const lecture: Lecture = ctx.request.body;
    const lectureId = await apiService.postLecture(lecture);
    ctx.body = lectureId;
  } catch (error) {
    Logger.error(error);
    ctx.status = 400;
  }
}

export async function deleteLecture(ctx: Context) {
  try {
    const id: number = ctx.query;
    await apiService.deleteLecture(id);
    ctx.status = 204;
  } catch (error) {
    Logger.error(error);
    ctx.status = 400;
  }
}

export default { postLecture, deleteLecture };
