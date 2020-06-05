import session from "koa-session";
import redisStore from "koa-redis";
import App from "../app";

const sessionMiddleware = (
  redisUrl: string,
  keys: string[],
  app: App,
  options = {}
) => {
  app.keys = keys;
  return session(
    {
      ...options,
      rolling: true,
      renew: true,
      store: redisStore({
        // eslint-disable-next-line @typescript-eslint/camelcase
        enable_offline_queue: false,
        url: redisUrl,
      }),
    },
    app
  );
};

export default sessionMiddleware;
