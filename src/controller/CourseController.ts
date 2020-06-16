import { Context } from "koa";
import { apiService } from "../services/backendApiService";
import { ApiCourseUpdate } from "../types/Course";

export async function getCourses(ctx: Context) {
    const { search, state } = ctx.request.body;
    const courses = await apiService.getCourses(search, state);
    ctx.body = { courses };
}

export async function updateCourse(ctx: Context) {
    const update: ApiCourseUpdate = ctx.request.body;
    const { id } = ctx.params;
    await apiService.updateCourse(id, update);
    ctx.body = "{}";
}

export default { getCourses, updateCourse };