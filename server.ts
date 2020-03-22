import { sequelize } from "./database";
import Koa from "koa";
import Router from "koa-router";
import { Student } from "./database/models/Student";
import { Pupil } from "./database/models/Pupil";

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 3000;

router.get("/", async ctx => {
	ctx.body = "Hello World";
});

router.get("/Students", async ctx => {
	Student.findAll()
		.then(result => {
			ctx.body = result;
		})
		.catch(err => {
			ctx.body = err;
		});
});

router.get("/Pupils", async ctx => {
	Pupil.findAll()
		.then(result => {
			ctx.body = result;
		})
		.catch(err => {
			ctx.body = err;
		});
});

app.use(router.routes()).use(router.allowedMethods());

sequelize.sync().then(() => {
	app.listen(PORT);
	console.log(`Server listening on ${PORT}`);
});
