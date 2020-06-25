import { Context } from "koa";
import { apiService } from "../services/backendApiService";
import { ApiScreeningResult } from "../types/Student";

export async function getInstructors(ctx: Context) {
    const { screeningState } = ctx.query;
    const instructors = await apiService.getInstructors(screeningState);
    ctx.body = { instructors };
}

export async function updateInstructor(ctx: Context) {
    const update: ApiScreeningResult = ctx.request.body;
    const { id } = ctx.params;
    const { instructor, screening} = await apiService.updateInstructor(id, update);
    ctx.body = { instructor, screening };
}

export default { getInstructors, updateInstructor };