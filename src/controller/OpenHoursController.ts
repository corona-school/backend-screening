import Redis from "ioredis";
import crypto from "crypto";
import LoggerService from "../utils/Logger";
import Response from "../utils/Response";
import {
  AUTH_REQUIRED,
  INVALID_REQUEST,
  UNKNOWN_ERROR,
} from "../constants/error";
import { Context } from "koa";

const Logger = LoggerService("OpenHoursController.ts");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const KEY = "OPENING_HOURS";

const client = new Redis(REDIS_URL);

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

// week: 1 = Monday, 2 = Tuesday ...
interface ITime {
  week: number;
  from: string;
  to: string;
}

interface IDatabaseTime extends ITime {
  id: string;
}

const admins = [
  "gero@corona-school.de",
  "mascha.matveeva@gmail.com",
  "reinerschristopher@gmail.com",
  "paul.renger@magd.ox.ac.uk",
  "Tobias.Bork@t-online.de",
  "s5alstri@uni-bonn.de",
  "lea.brinkmeier@web.de",
  "lennard.schiefelbein@lern-fair.de",
  "test+dev+sc1@lern-fair.de",
];

const getOpeningHours = async (ctx: Context) => {
  try {
    ctx.body = (await get(KEY)) ?? [];
  } catch (err) {
    Logger.error(err);
    Response.internalServerError(ctx, UNKNOWN_ERROR);
  }
};

const changeOpeningHours = async (ctx: Context) => {
  const email = ctx.session.passport.user;

  if (!email) {
    return Response.badRequest(ctx, INVALID_REQUEST);
  }

  if (!admins.includes(email)) {
    return Response.unauthorized(ctx, AUTH_REQUIRED);
  }

  try {
    const data: ITime[] = ctx.request.body;
    const save: IDatabaseTime[] = data.map((t) => {
      const id = `${t.week}-${t.from}-${t.to}`;
      return { ...t, id: crypto.createHash("md5").update(id).digest("hex") };
    });
    await set(KEY, JSON.stringify(save));
    ctx.body = await get(KEY);
  } catch (err) {
    ctx.body = err;
  }
};

export default { getOpeningHours, changeOpeningHours };
