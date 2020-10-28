"use strict";

import cors from "@koa/cors";
import { Context } from "koa";
import config from "../config";
import { validOrigins, validReviewAppOrigins } from "../constants/origins";

const corsMiddleware = (options = {}) => {
  function originIsValid(origin: string): boolean {
    if (config.env === "development" && validReviewAppOrigins.some(regexp => origin.match(regexp))) {
      return true;
    }
    return validOrigins.indexOf(origin) != -1;
  }

  function verifyOrigin(ctx: Context): any {
    const origin = ctx.headers.origin;
    if (!originIsValid(origin)) return false;
    return origin;
  }

  return cors({
    ...options,
    origin: verifyOrigin,
  });
};

export default corsMiddleware;
