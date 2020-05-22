import passport from "koa-passport";
import PassportLocal from "passport-local";
import bcrypt from "bcrypt";
import { apiService } from "./services/backendApiService";
import { Screener } from "./types/Screener";
import LoggerService from "./utils/Logger";
import Response from "./utils/response";
import { AUTH_REQUIRED } from "./constants/error";
const Logger = LoggerService("auth.ts");

const LocalStrategy = PassportLocal.Strategy;

passport.serializeUser((email: string, done: Function) => {
  done(null, email);
});

passport.deserializeUser((email: string, done: Function) => {
  return apiService
    .getVerifiedScreener(email, false)
    .then((screener) => {
      return done(null, screener);
    })
    .catch((err) => done(err, null));
});

const comparePassword = (
  password: string,
  screener: Screener
): Promise<Screener> => {
  return new Promise((resolve, reject) => {
    // Workaround: https://stackoverflow.com/questions/23015043/verify-password-hash-in-nodejs-which-was-generated-in-php
    const hash = screener.password.replace(/^\$2y(.+)$/i, "$2a$1");

    bcrypt.compare(password, hash, (err, ok) => {
      if (err) {
        Logger.error(err);
        reject(err);
      }
      if (!ok) {
        Logger.warn(`Screener ${screener.email} used the wrong password.`);
        reject("Password not correct.");
      }
      resolve(screener);
    });
  });
};

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    (email: string, password: string, done: Function) => {
      apiService
        .getVerifiedScreener(email, true)
        .then((screener) => comparePassword(password, screener))
        .then((screener) => done(null, screener.email))
        .catch((err) => done(err, null));
    }
  )
);

export const requireAuth = async (ctx: any, next: any) => {
  if (ctx.isAuthenticated()) {
    return await next();
  } else {
    Response.unauthorized(ctx, AUTH_REQUIRED);
  }
};
