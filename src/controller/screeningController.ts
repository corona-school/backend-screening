import Router from "koa-router";
import { Student } from "../database/models/Student";
import Queue, { Job } from "../queue";

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
		ctx.body = "error";
		return;
	}

	const job: Job = {
		firstname: student.firstname,
		lastname: student.lastname,
		email: student.email,
		time: Date.now(),
		status: "waiting"
	};

	ctx.body = await myQueue.add(job);
});

router.post("/complete", async ctx => {
	ctx.body = "removed first";
});

router.get("/jobs", async ctx => {
	ctx.body = await myQueue.list();
});

export default router;
