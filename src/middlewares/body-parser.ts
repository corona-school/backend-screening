"use strict";

import bodyParser from "koa-body";
import { InvalidRequestBodyFormat } from "../errors";

/**
 * Return middleware that parses HTTP request body.
 *
 * @param {Object} [options={}] - Optional configuration.
 * @return {function} Koa middleware.
 * @throws {InvalidRequestBodyFormat} When failed to parse the request body.
 */
const BodyParser = (options = {}) => {
  return bodyParser({
    ...options,
    onError: () => {
      throw new InvalidRequestBodyFormat(
        "Invalid format is detected in the request body"
      );
    },
  });
};

export default BodyParser;
