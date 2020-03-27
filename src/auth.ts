import passport from "koa-passport";
import PassportLocal from "passport-local";
import bcrypt from "bcrypt";
import { Screener, getScreener } from "./database/models/Screener";
const LocalStrategy = PassportLocal.Strategy;

passport.serializeUser((email: string, done: Function) => {
  done(null, email);
});

passport.deserializeUser((email: string, done: Function) => {
  getScreener(email)
    .then((screener) => done(null, screener))
    .catch((err) => done(err, null));
});

const comparePassword = (
  password: string,
  screener: Screener
): Promise<Screener> => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, screener.password, (err, ok) => {
      if (err) {
        console.error(err);
        reject(err);
      }
      if (!ok) {
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
      getScreener(email)
        .then((screener) => comparePassword(password, screener))
        .then((screener) => done(null, screener.email))
        .catch((err) => done(err, null));
    }
  )
);
