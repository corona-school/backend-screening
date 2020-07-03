import { Context } from "koa";
import { apiService } from "../services/backendApiService";
import { ApiScreeningResult } from "../types/Student";

export async function getInstructors(ctx: Context) {
    const { screeningStatus, search } = ctx.query;
    const instructors = await apiService.getInstructors(screeningStatus, search);
    ctx.body = { instructors };
}

export async function updateInstructor(ctx: Context) {
    const update: ApiScreeningResult = ctx.request.body;
    const { id } = ctx.params;
    const screenerEmail = ctx.state.user.email;
    console.log(`Screener(${screenerEmail}) is updating Instructor(${id})`);
    const { instructor } = await apiService.updateInstructor(id, { ...update, screenerEmail });
    ctx.body = { instructor };
}

export default { getInstructors, updateInstructor };