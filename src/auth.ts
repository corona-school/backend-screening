
import passport from "koa-passport";
const LocalStrategy = require('passport-local').Strategy;
import bcrypt from "bcrypt";
import { Screener } from "./database/models/Screener";


passport.serializeUser((user: Screener, done) => { done(null, user.email); });

passport.deserializeUser((email: string, done: Function) => {
	Screener.findOne({
		where: {
			email
		}
	})
		.then(user => { done(null, user); })
		.catch(err => { done(err, null); });
});

passport.use(new LocalStrategy({ usernameField: "email" }, (email: string, password: string, done: Function) => {
	Screener.findOne({
		where: {
			email
		}
	})
		.then(screener => {
			if (!screener) { return done(null, false); }

			bcrypt.compare(password, screener.passwordHash, (err, ok) => {
				if (err) {
					console.error("login attempt failed:", err);
					return done(err);
				}
				return ok ? done(null, screener) : done(null, false);
			});
		})
		.catch(err => { return done(err); });
}));
