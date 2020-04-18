import Router from "koa-router";
import passport from "koa-passport";
import bcrypt from "bcrypt";
import { apiService } from "../api/backendApiService";
import { ScreenerRequest } from "../models/Screener";
import { requireAuth } from "../auth";

const screenerRouter = new Router();

screenerRouter.post("/screener/create", requireAuth, async (ctx) => {
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
    console.error(err);
    ctx.body = "Could not create Screener: " + err.toString();
    ctx.status = 400;
  }
});

screenerRouter.get("/screener/status", async (ctx: any) => {
  if (ctx.isAuthenticated()) {
    const from = ctx.session.passport.user;

    ctx.body = await apiService.getScreener(from, false);
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
});

screenerRouter.post("/screener/login", async (ctx: any, next) => {
  return passport.authenticate("local", async (err, email) => {
    if (!email || err) {
      ctx.body = { success: false };
      ctx.throw(401);
    }

    ctx.body = await apiService.getScreener(email, false);
    return ctx.login(email);
  })(ctx, next);
});

screenerRouter.get("/screener/logout", (ctx: any) => {
  if (ctx.isAuthenticated()) {
    ctx.logout();
    ctx.redirect("/");
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
});

screenerRouter.get("/screener/info", requireAuth, async (ctx) => {
  const { email } = ctx.request.query;
  const screener = await apiService.getScreener(email);
  if (!screener) {
    ctx.body = "Could not find screener.";
    ctx.status = 400;
    return;
  }
  ctx.body = screener;
});

export { screenerRouter };
