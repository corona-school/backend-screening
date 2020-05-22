"use strict";

import ClientFailure from "./";

/**
 * Thrown when the request body has an invalid format.
 */
class InvalidRequestBodyFormat extends ClientFailure {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRequestBodyFormat";
  }
}

export default InvalidRequestBodyFormat;
