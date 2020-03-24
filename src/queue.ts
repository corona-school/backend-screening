import redis, { RedisClient } from "redis";

const KEY = "QUEUE";

type Status = "waiting" | "active" | "completed" | "rejected";

export interface Job {
	firstname: string;
	lastname: string;
	email: string;
	time: number;
	status: Status;
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

	getJob = async (email: string) => {
		const currentList = await this.list();
		return currentList.find(job => job.email === email);
	};

	changeStatus = (email: string, status: Status) => {};

	reset = () => {};

	list = (): Promise<Job[]> => {
		return new Promise((resolve, reject) => {
			this.client.lrange(KEY, 0, -1, (err, res) => {
				if (err) {
					reject(err);
				} else {
					const list: Job[] = res.map(job => JSON.parse(job));
					resolve(list.sort((a, b) => a.time - b.time));
				}
			});
		});
	};
}
