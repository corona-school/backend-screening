"use strict";

import ClientFailure from ".";

/**
 * Thrown when a requested resource does not exist.
 */
class UnknownResourceError extends ClientFailure {
  constructor(message: string) {
    super(message);
    this.name = "UnknownResourceError";
  }
}

export default UnknownResourceError;
