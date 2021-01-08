import { Context } from "koa";
import { apiService } from "../services/backendApiService";
import { ApiCourseUpdate } from "../types/Course";

export async function getCourses(ctx: Context) {
    const { search, courseState, page } = ctx.query;
    const courses = await apiService.getCourses(search, courseState, page);
    ctx.body = { courses };
}

export async function getCourseTags(ctx: Context) {
  const courseTags = await apiService.getCourseTags();
  ctx.body = { courseTags };
}

export async function updateCourse(ctx: Context) {
  const update: ApiCourseUpdate = ctx.request.body;
  const { id } = ctx.params;
  const course = await apiService.updateCourse(id, update);
  ctx.body = { course };
}

export default { getCourses, getCourseTags, updateCourse };
