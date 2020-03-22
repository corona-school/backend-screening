import { Sequelize } from "sequelize-typescript";
import { Pupil } from "./models/Pupil";
import { Student } from "./models/Student";

const uri =
	"postgres://gtvbiyqsqzpvux:1c5e74ca86e2a1a8f7d0c62339d82c3362cfa943909d192b62f7624fac04ef96@ec2-54-217-204-34.eu-west-1.compute.amazonaws.com:5432/dd9819bgb2fqei";

export const sequelize = new Sequelize(uri, {
	dialect: "postgres",
	ssl: true,
	native: true,
	models: [Student, Pupil]
});
