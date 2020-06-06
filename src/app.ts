"use strict";
import socket from "socket.io";
import Koa from "koa";
import { Server } from "http";
import bodyParser from "./middlewares/body-parser";
import cors from "./middlewares/cors";
import errorHandler from "./middlewares/error-handler";
import { corsConfig } from "./config/cors";
import router from "./routes";
import sessionMiddleware from "./middlewares/session";
import { Config } from "./config";
import koaPassport from "koa-passport";
import SocketController from "./socket/socketController";
import QueueService from "./services/QueueService";
import { StudentData, ScreenerInfo } from "./types/Queue";

class App extends Koa {
  server: Server;
  config: Config;
  io: SocketIO.Server;

  constructor(config: Config) {
    super();

    this.config = config;
    // Trust proxy
    this.proxy = true;
    // Disable `console.errors` except development env
    this.silent = this.env !== "development";

    this._configureMiddlewares();
    this._configureRoutes();
  }

  _configureMiddlewares() {
    this.use(errorHandler());
    this.use(
      bodyParser({
        enableTypes: ["json"],
        jsonLimit: "10mb",
      })
    );
    this.use(cors(corsConfig));
    this.use(
      sessionMiddleware(
        this.config.redisUrl,
        this.config.sessionKeys,
        this,
        this.config.session
      )
    );
    this.use(koaPassport.initialize());
    this.use(koaPassport.session());
  }

  _configureRoutes() {
    this.use(router.routes());
    this.use(router.allowedMethods());
  }

  listen(...args: any) {
    const server = super.listen(...args);
    this.server = server;
    this.io = socket(this.server);
    this.initialize();
    return server;
  }

  initialize() {
    QueueService.initialize(this.config.redisUrl).addQueue<
      StudentData,
      ScreenerInfo
    >("StudentQueue");

    SocketController(this.io, "StudentQueue");
  }

  async terminate() {
    if (this.server) {
      this.server.close();
    }
  }
}

export default App;
