import redis, { RedisClient } from "redis";
import { reject } from "bluebird";

const KEY = "QUEUE";

export type Status = "waiting" | "active" | "completed" | "rejected";

export interface Job {
	firstname: string;
	lastname: string;
	email: string;
	time: number;
	jitsi: string;
	status: Status;
}

export default class Queue {
	private client: RedisClient;

	constructor(url: string) {
		this.client = redis.createClient({ url: url });
	}

	hasJob = async (email: String) => {
		const list = await this.list();
		return list.some(job => job.email === email);
	};

	add = async (job: Job) => {
		if (await this.hasJob(job.email)) {
			return await this.getJob(job.email);
		}
		return new Promise((resolve, reject) => {
			this.client.rpush(KEY, JSON.stringify(job), (err, res) => {
				if (err) {
					return reject(err);
				} else {
					resolve(job);
				}
			});
		});
	};

	remove = async (email: string) => {
		const job = await this.getJob(email);
		return this.client.lrem(KEY, 0, JSON.stringify(job));
	};

	getJobInfo = async (email: string) => {
		const currentList = await this.list();
		const index: number = currentList.findIndex(job => job.email === email);
		const job: Job | null = currentList.find(job => job.email === email);
		if (index === -1 || !job) {
			return null;
		}
		return { ...job, position: index + 1 };
	};

	private getJob = async (email: string) => {
		const currentList = await this.list();
		return currentList.find(job => job.email === email);
	};

	changeStatus = async (email: string, status: Status) => {
		let job = await this.getJob(email);
		const list = await this.list();
		const index = list.findIndex(job => job.email === email);
		job.status = status;
		this.client.lset(KEY, index, JSON.stringify(job));
	};

	reset = () => {
		this.client.del(KEY);
	};

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

	listInfo = async () => {
		return new Promise((resolve, reject) => {
			this.list()
				.then(list => {
					resolve(list.map((job, index) => ({ ...job, position: index + 1 })));
				})
				.catch(err => {
					reject(err);
				});
		});
	};
}
