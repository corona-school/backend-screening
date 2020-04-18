import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import QueueLog from "./models/QueueLog";
dotenv.config();

const uri =
  process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_COPPER_URL;

export const sequelize = new Sequelize(uri, {
  logging: false,
  dialect: "postgres",
  ssl: true,
  native: true,
  models: [QueueLog],
});
