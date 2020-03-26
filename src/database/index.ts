import { Sequelize } from "sequelize-typescript";
import { Student } from "./models/Student";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.DATABASE_URL;

export const sequelize = new Sequelize(uri, {
	dialect: "postgres",
	ssl: true,
	native: true,
	models: [Student]
});
