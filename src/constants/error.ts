"use strict";

/**
 * Client Failures
 */
export const AUTH_REQUIRED = {
  statusCode: 401,
  code: "AUTH_REQUIRED",
  message: "Authentication is needed to access the requested endpoint.",
};

export const UNKNOWN_ENDPOINT = {
  statusCode: 404,
  code: "UNKNOWN_ENDPOINT",
  message: "The requested endpoint does not exist.",
};

export const UNKNOWN_RESOURCE = {
  statusCode: 404,
  code: "UNKNOWN_RESOURCE",
  message: "The specified resource was not found.",
};

export const INVALID_REQUEST_BODY_FORMAT = {
  statusCode: 422,
  code: "INVALID_REQUEST_BODY_FORMAT",
  message: "The request body has invalid format.",
};

export const INVALID_REQUEST = {
  statusCode: 422,
  code: "INVALID_REQUEST",
  message: "The request has invalid parameters.",
};

/**
 * Server Errors
 */
export const INTERNAL_ERROR = {
  statusCode: 500,
  code: "INTERNAL_ERROR",
  message: "The server encountered an internal error.",
};

export const UNKNOWN_ERROR = {
  statusCode: 500,
  code: "UNKNOWN_ERROR",
  message: "The server encountered an unknown error.",
};
