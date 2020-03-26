import Koa from "koa";
import Router from "koa-router";
import koaBody from "koa-body";
const cors = require("@koa/cors");
import dotenv from "dotenv";
import { sequelize } from "./database";
import screeningRouter from "./controller/screeningController";

dotenv.config();

const app = new Koa();
app.use(koaBody());
app.use(cors());

const router = new Router();
const PORT = process.env.PORT || 3000;

router.get("/", async ctx => {
	ctx.body = "Hello World";
});

app
	.use(router.routes())
	.use(screeningRouter.routes())
	.use(router.allowedMethods());

sequelize
	.sync()
	.then(() => {
		app.listen(PORT);
		console.log(`Server listening on ${PORT}`);
	})
	.catch(err => {
		console.error(err);
	});
