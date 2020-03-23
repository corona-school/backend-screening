import { sequelize } from "./database";
import Koa from "koa";
import Router from "koa-router";
import { Student } from "./database/models/Student";
import Queue from "bull";
import dotenv from "dotenv";
dotenv.config();

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Create / Connect to a named work queue
let workQueue = new Queue("work", REDIS_URL);

router.get("/", async ctx => {
	ctx.body = "Hello World";
});

router.get("/add", async ctx => {
	let job = await workQueue.add({ text: "Stuff" });
	ctx.body = job.id;
});

router.get("/jobs", async ctx => {
	ctx.body = await workQueue.getJobs([]);
});

router.get("/Students", async ctx => {
	await Student.findAll()
		.then(result => {
			ctx.body = result;
		})
		.catch(err => {
			console.log(err);
			ctx.body = "Nooo";
		});
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
