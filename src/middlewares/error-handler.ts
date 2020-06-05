"use strict";

import Response from "../utils/Response";
import { InvalidRequestBodyFormat } from "../errors";
import {
  UNKNOWN_ENDPOINT,
  INVALID_REQUEST_BODY_FORMAT,
  UNKNOWN_ERROR,
} from "../constants/error";
import { Context, Next } from "koa";

const ErrorHandler = () => {
  return async function errorHandler(ctx: Context, next: Next) {
    try {
      await next();

      if (!ctx.body && (!ctx.status || ctx.status === 404)) {
        return Response.notFound(ctx, UNKNOWN_ENDPOINT);
      }
    } catch (err) {
      if (err instanceof InvalidRequestBodyFormat) {
        return Response.unprocessableEntity(ctx, INVALID_REQUEST_BODY_FORMAT);
      }
      return Response.internalServerError(ctx, UNKNOWN_ERROR);
    }
  };
};

export default ErrorHandler;
