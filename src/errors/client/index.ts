"use strict";

import ApplicationError from "../application-error";

/**
 * Thrown when the client send an invalid request.
 */
class ClientFailure extends ApplicationError {
  constructor(message: string) {
    super(message);
    this.name = "ClientFailure";
  }
}

export default ClientFailure;
