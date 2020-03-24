import { sequelize } from "./database";
import Koa from "koa";
import Router from "koa-router";
import dotenv from "dotenv";
import koaBody from "koa-body";
import redis from "redis";
import Queue, { Job } from "./queue";
import { Student } from "./database/models/Student";

dotenv.config();

const app = new Koa();
app.use(koaBody());
const router = new Router();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const myQueue = new Queue(REDIS_URL);

router.get("/", async ctx => {
	ctx.body = "Hello World";
});

const key = "queue";

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

app.use(router.routes()).use(router.allowedMethods());

sequelize
	.sync()
	.then(() => {
		app.listen(PORT);
		console.log(`Server listening on ${PORT}`);
	})
	.catch(err => {
		app.listen(PORT);
		console.log(`Server listening on ${PORT}`);
		console.error(err);
	});
