import Router from "koa-router";
import redis from "redis";
import LoggerService from "../utils/Logger";
import { reject } from "bluebird";
const Logger = LoggerService("openHoursController.ts");

const openHoursController = new Router();

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const KEY = "OPENING_HOURS";

const client = redis.createClient({ url: REDIS_URL });

const get = (key: string) => {
  return new Promise((resolve, reject) => {
    client.get(key, (err, reply) => {
      if (err) {
        reject(err);
      }
      resolve(JSON.parse(reply));
    });
  });
};

const set = (key: string, data: string) => {
  return new Promise((resolve, reject) => {
    client.set(key, data, (err, success) => {
      if (err) {
        reject(err);
      }
      if (!success) {
        reject("No opening hours found.");
      }
      resolve(success);
    });
  });
};

interface ITime {
  from: string;
  to: string;
}

interface IOpeningHours {
  Monday: {
    times: ITime[];
  };
  Tuesday: {
    times: ITime[];
  };
  Wednesday: {
    times: ITime[];
  };
  Thursday: {
    times: ITime[];
  };
  Friday: {
    times: ITime[];
  };
  Saturday: {
    times: ITime[];
  };
  Sunday: {
    times: ITime[];
  };
}

openHoursController.get("/openingHours", async (ctx) => {
  try {
    ctx.body = await get(KEY);
  } catch (err) {
    ctx.body = err;
  }
});

openHoursController.post("/openingHours", async (ctx) => {
  try {
    const data: IOpeningHours = ctx.request.body;
    await set(KEY, JSON.stringify(data));
    ctx.body = await get(KEY);
  } catch (err) {
    ctx.body = err;
  }
});

export { openHoursController };
