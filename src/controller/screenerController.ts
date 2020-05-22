import passport from "koa-passport";
import bcrypt from "bcrypt";
import { apiService } from "../services/backendApiService";
import { ScreenerRequest } from "../types/Screener";
import LoggerService from "../utils/Logger";
import { Context, Next } from "koa";
const Logger = LoggerService("screenerController.ts");

const create = async (ctx: any) => {
  const { firstname, lastname, email, password } = ctx.request.body;

  try {
    const screener: ScreenerRequest = {
      firstname,
      lastname,
      email,
      password: await bcrypt.hash(password, bcrypt.genSaltSync(8)),
    };
    await apiService.createScreener(screener);
    ctx.body = screener;
  } catch (err) {
    Logger.error(err);
    ctx.body = "Could not create Screener: " + err.toString();
    ctx.status = 400;
  }
};

const getStatus = async (ctx: any) => {
  if (ctx.isAuthenticated()) {
    const from = ctx.session.passport.user;

    ctx.body = await apiService.getScreener(from, false);
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
};

const login = async (ctx: any, next: any) => {
  return passport.authenticate("local", async (err, email) => {
    if (!email || err) {
      ctx.body = { success: false };
      ctx.throw(401);
    }
    Logger.info(`Screener ${email} logged in!`);
    await ctx.login(email);
    ctx.body = await apiService.getScreener(email, false);
  })(ctx, next);
};

const logout = (ctx: any) => {
  if (ctx.isAuthenticated()) {
    const from = ctx.session.passport.user;
    Logger.info(`Screener ${from} logged out!`);
    ctx.logout();
    ctx.redirect("/");
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
};

const getInfo = async (ctx: any) => {
  const { email } = ctx.request.query;
  const screener = await apiService.getScreener(email);
  if (!screener) {
    ctx.body = "Could not find screener.";
    ctx.status = 400;
    return;
  }
  ctx.body = screener;
};

export default { create, getStatus, login, logout, getInfo };
