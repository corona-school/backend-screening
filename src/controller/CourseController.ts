import { Context } from "koa";
import { apiService } from "../services/backendApiService";
import { ApiCourseUpdate } from "../types/Course";

export async function getCourses(ctx: Context) {
    const { search, courseState } = ctx.request.body;
    const courses = await apiService.getCourses(search, courseState);
    ctx.body = { courses };
}

export async function updateCourse(ctx: Context) {
    const update: ApiCourseUpdate = ctx.request.body;
    const { id } = ctx.params;
    const course = await apiService.updateCourse(id, update);
    ctx.body = { course };
}

export default { getCourses, updateCourse };