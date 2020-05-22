export const corsConfig = {
  credentials: true,
  allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
  allowHeaders: [
    "X-Requested-With",
    "X-HTTP-Method-Override",
    "Content-Type",
    "Authorization",
    "Accept",
    "Set-Cookie",
    "Cookie",
  ],
  exposeHeaders: [
    "Content-Length",
    "Date",
    "X-Request-Id",
    "Cookie",
    "Set-Cookie",
  ],
  keepHeadersOnError: true,
};
