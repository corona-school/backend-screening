import { sequelize } from "./database";
import Koa from "koa";
import Router from "koa-router";
import dotenv from "dotenv";
import koaBody from "koa-body";
import redis from "redis";
dotenv.config();

const app = new Koa();
app.use(koaBody());
const router = new Router();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const client = redis.createClient({ url: REDIS_URL });

router.get("/", async ctx => {
	ctx.body = "Hello World";
});

const key = "queue";

router.post("/add", async ctx => {
	const { id, firstname, lastname } = ctx.request.body;
	const data = {
		id,
		firstname,
		lastname
	};
	console.log(data);

	ctx.body = await new Promise((resolve, reject) => {
		client.rpush(key, JSON.stringify(data), (err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res);
			}
		});
	});
});

router.post("/complete", async ctx => {
	client.lpop(key);
	ctx.body = "removed first";
});

router.get("/jobs", async ctx => {
	ctx.body = await new Promise((resolve, reject) => {
		client.lrange(key, 0, -1, (err, res) => {
			if (err) {
				reject(err);
			} else {
				resolve(res.map(job => JSON.parse(job)));
			}
		});
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
