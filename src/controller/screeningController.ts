import Router from "koa-router";
import { Student } from "../database/models/Student";
import Queue, { Job, Status } from "../queue";
import { createJob } from "../utils/jobUtils";

const router = new Router();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const myQueue = new Queue(REDIS_URL);

router.post("/add", async ctx => {
	const { email } = ctx.request.body;

	const student = await Student.findOne({
		where: {
			email
		}
	});
	if (student === null) {
		ctx.body = "an error occured";
		ctx.status = 500;
		return;
	}

	ctx.body = await myQueue.add(createJob(student));
});

router.post("/jobInfo", async ctx => {
	const { email } = ctx.request.body;
	ctx.body = await myQueue.getJob(email);
});

router.post("/changeStatus", async ctx => {
	const { email, status } = ctx.request.body;
	if (!email || !status) {
		ctx.body = "an error occurred";
		ctx.status = 401;
	}
	await myQueue.changeStatus(email, status);
	ctx.body = await myQueue.getJob(email);
});

router.post("/reset", async ctx => {
	await myQueue.reset();
	ctx.body = await myQueue.list();
});

router.get("/jobs", async ctx => {
	ctx.body = await myQueue.list();
});

export default router;
