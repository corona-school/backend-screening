import { Sequelize } from "sequelize-typescript";
import { Student } from "./models/Student";
import dotenv from "dotenv";
import { Screener } from "./models/Screener";
dotenv.config();

const uri =
  process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_COPPER_URL;

export const sequelize = new Sequelize(uri, {
  dialect: "postgres",
  ssl: true,
  native: true,
  models: [Student, Screener],
});
