import Koa, { Context } from "koa";
import Router from "koa-router";
import koaBody from "koa-body";
import session from "koa-session";
import passport from "koa-passport";
import cors from "@koa/cors";
import redisStore from "koa-redis";
import dotenv from "dotenv";

dotenv.config();

import socket from "socket.io";
import http from "http";

import { sequelize } from "./database";
import cleanup from "./jobs/cleanup";
import {
  screenerRouter,
  studentRouter,
  queueRouter,
  statisticsRouter,
} from "./controller";
import Queue from "./queue";
import SocketController from "./socket/socketController";
import LoggerService from "./utils/Logger";
import chalk from "chalk";

const Logger = LoggerService("server.ts");

const app = new Koa();
app.use(koaBody());

const validOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "https://corona-school-admin-dev.herokuapp.com",
  "https://corona-school-admin.herokuapp.com",
  "https://authentication.corona-school.de",
  "https://screeners.corona-school.de",
  "https://corona-student-dev.herokuapp.com",
  "https://corona-student-app.herokuapp.com",
];
function originIsValid(origin: string): boolean {
  return validOrigins.indexOf(origin) != -1;
}

function verifyOrigin(ctx: Context): any {
  const origin = ctx.headers.origin;
  if (!originIsValid(origin)) return false;
  return origin;
}

app.use(
  cors({
    credentials: true,
    origin: verifyOrigin,
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [
      "X-Requested-With",
      "X-HTTP-Method-Override",
      "Content-Type",
      "Accept",
      "Set-Cookie",
      "Cookie",
    ],
    exposeHeaders: ["Cookie", "Set-Cookie"],
    keepHeadersOnError: true,
  })
);

let sessionConfig = {};

if (process.env.NODE_ENV === "production") {
  sessionConfig = {
    secure: true,
    sameSite: "none",
  };
}

// sessions
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
app.keys = [process.env.COOKIE_SESSION_SECRET];
app.use(
  session(
    {
      ...sessionConfig,
      rolling: true,
      renew: true,
      store: redisStore({
        // eslint-disable-next-line @typescript-eslint/camelcase
        enable_offline_queue: false,
        url: REDIS_URL,
      }),
    },
    app
  )
);

app.proxy = true;

// authentication
require("./auth");
app.use(passport.initialize());
app.use(passport.session());

const router = new Router();
const PORT = process.env.PORT || 3001;

router.get("/", async (ctx) => {
  ctx.body = "Hello World";
});

export const studentQueue = new Queue("StudentQueue");

app
  .use(router.routes())
  .use(screenerRouter.routes())
  .use(studentRouter.routes())
  .use(queueRouter.routes())
  .use(statisticsRouter.routes())
  .use(screenerRouter.allowedMethods())
  .use(studentRouter.allowedMethods())
  .use(queueRouter.allowedMethods())
  .use(statisticsRouter.allowedMethods())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());
export const io: SocketIO.Server = socket(server);

SocketController();

sequelize
  .sync()
  .then(() => {
    server.listen(PORT, () => {
      Logger.info(`Server listening on ${chalk.bgGreenBright(PORT)}`);
      cleanup.invoke();
    });
  })
  .catch((err) => {
    cleanup.cancel();
    Logger.error(err);
  });
