import passport from "koa-passport";
import PassportLocal from "passport-local";
import bcrypt from "bcrypt";
import { Screener, getScreener } from "./database/models/Screener";
const LocalStrategy = PassportLocal.Strategy;

passport.serializeUser((user: Screener, done) => {
	done(null, user.email);
});

passport.deserializeUser((email: string, done: Function) => {
	getScreener(email)
		.then(screener => done(null, screener))
		.catch(err => done(err, null));
});

passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		(email: string, password: string, done: Function) => {
			getScreener(email)
				.then(screener => comparePassword(password, screener))
				.then(success => done(null, success))
				.catch(err => done(err, null));
		}
	)
);

const comparePassword = (password: string, screener: Screener) => {
	return new Promise((resolve, reject) => {
		bcrypt.compare(password, screener.passwordHash, (err, ok) => {
			if (err) {
				console.error(err);
				reject(err);
			}
			resolve(ok);
		});
	});
};
