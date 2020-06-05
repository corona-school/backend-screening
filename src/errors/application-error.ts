"use strict";

/**
 * The Base Error all Application Errors inherit from.
 */
class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApplicationError";
  }
}

export default ApplicationError;
