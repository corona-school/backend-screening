import Koa from "koa";
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
import screeningRouter from "./controller/screeningController";
import screeningControllerSocket from "./controller/screeningControllerSocket";

const app = new Koa();
app.use(koaBody());

const validOrigins = [
  `https://corona-school-admin-dev.herokuapp.com`,
  "https://corona-school-admin.herokuapp.com",
  "https://authentication.corona-school.de",
  "https://screeners.corona-school.de",
  "https://corona-student-dev.herokuapp.com",
  "https://corona-student-app.herokuapp.com",
];
function originIsValid(origin: any): any {
  return validOrigins.indexOf(origin) != -1;
}

function verifyOrigin(ctx: any): any {
  const origin = ctx.headers.origin;
  if (!originIsValid(origin)) return false;
  return origin;
}

app.use(
  cors({
    origin: verifyOrigin,
    credentials: true,
    allowMethods: ["*"],
    allowHeaders: [
      "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept",
    ],
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

app
  .use(router.routes())
  .use(screeningRouter.routes())
  .use(router.allowedMethods());

const server = http.createServer(app.callback());
const io = socket(server);

screeningControllerSocket(io);

sequelize
  .sync()
  .then(() => {
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch((err) => {
    console.error(err);
  });
