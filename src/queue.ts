import redis, { RedisClient } from "redis";
import { Student } from "./database/models/Student";

const KEY = "QUEUE";

export interface Job {
	firstname: string;
	lastname: string;
	email: string;
	status: "waiting" | "active" | "completed" | "rejected";
}

export default class Queue {
	private client: RedisClient;

	constructor(url: string) {
		this.client = redis.createClient({ url: url });
	}

	add = (job: Job) => {
		return new Promise((resolve, reject) => {
			this.client.rpush(KEY, JSON.stringify(job), (err, res) => {
				if (err) {
					return reject(err);
				} else {
					resolve({
						...job,
						count: res
					});
				}
			});
		});
	};

	list = () => {
		return new Promise((resolve, reject) => {
			this.client.lrange(KEY, 0, -1, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res.map(job => JSON.parse(job)));
				}
			});
		});
	};
}
