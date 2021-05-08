"use strict";

import ClientFailure from "./";

/**
 * Thrown when the user attempts to log in but does not have a verified email address.
 */
class NotVerified extends ClientFailure {
  constructor(message: string) {
    super(message);
    this.name = "NotVerified";
  }
}

export default NotVerified;
