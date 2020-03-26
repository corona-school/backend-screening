import Router from "koa-router";
import { Student } from "../database/models/Student";
import Queue from "../queue";
import { createJob } from "../utils/jobUtils";

const router = new Router();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const myQueue = new Queue(REDIS_URL);

router.post("/student/login", async ctx => {
	const { email } = ctx.request.body;

	const student = await Student.findOne({
		where: {
			email
		}
	});
	if (student === null) {
		ctx.body = `Could not find a Student with email: ${email}`;
		ctx.status = 500;
		return;
	}
	const jobInfo = await myQueue.add(createJob(student));
	if (jobInfo === null) {
		ctx.body = "Could not add Job to Queue. Please try again later..";
		ctx.status = 500;
		return;
	}
	ctx.body = jobInfo;
});

router.post("/student/logout", async ctx => {
	const { email } = ctx.request.body;

	ctx.body = await myQueue.remove(email);
});

router.post("/student/jobInfo", async ctx => {
	const { email } = ctx.request.body;
	ctx.body = await myQueue.getJobWithPosition(email);
});

router.post("/student/changeStatus", async ctx => {
	const { email, status } = ctx.request.body;
	if (!email || !status) {
		ctx.body = "Could not change Status of Student.";
		ctx.status = 401;
	}
	ctx.body = await myQueue.changeStatus(email, status);
});

router.post("/student/complete", async ctx => {
	const { email, isVerified } = ctx.request.body;
	if (!email || !isVerified) {
		ctx.body = "Could not verify Student.";
		ctx.status = 401;
	}
	ctx.body = await myQueue.changeStatus(email, isVerified ? "completed" : "rejected");
});

router.post("/queue/reset", async ctx => {
	await myQueue.reset();
	ctx.body = await myQueue.list();
});

router.post("/queue/jobs", async ctx => {
	ctx.body = await myQueue.listInfo();
});

export default router;
