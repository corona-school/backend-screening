import { Sequelize } from "sequelize-typescript";
import QueueLog from "./models/QueueLog";

const uri =
  process.env.DATABASE_URL || process.env.HEROKU_POSTGRESQL_COPPER_URL;

export const sequelize = new Sequelize(uri, {
  logging: false,
  dialect: "postgres",
  ssl: true,
  native: true,
  models: [QueueLog],
});
