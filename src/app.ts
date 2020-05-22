"use strict";

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

class App extends Koa {
  servers: Server[];
  config: Config;

  constructor(config: Config) {
    super();

    this.config = config;
    // Trust proxy
    this.proxy = true;
    // Disable `console.errors` except development env
    this.silent = this.env !== "development";

    this.servers = [];

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
    this.servers.push(server);
    return server;
  }

  async terminate() {
    for (const server of this.servers) {
      server.close();
    }
  }
}

export default App;
