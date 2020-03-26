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
			return await this.getJobWithPosition(job.email);
		}
		return new Promise((resolve, reject) => {
			this.client.rpush(KEY, JSON.stringify(job), err => {
				if (err) {
					return reject(err);
				} else {
					resolve(this.getJobWithPosition(job.email));
				}
			});
		});
	};

	remove = async (email: string) => {
		const job = await this.getJob(email);
		return this.client.lrem(KEY, 0, JSON.stringify(job));
	};

	getJobWithPosition = async (email: string) => {
		const currentList = await this.list();
		const position: number = currentList.findIndex(job => job.email === email);
		if (position === -1) {
			return null;
		}
		const job: Job = currentList[position];
		return job ? { ...job, position } : null;
	};

	private getJob = async (email: string) => {
		const currentList = await this.list();
		return currentList.find(job => job.email === email);
	};

	changeStatus = async (email: string, status: Status) => {
		const { position, ...job } = await this.getJobWithPosition(email);
		job.status = status;
		this.client.lset(KEY, position, JSON.stringify(job));
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
					resolve(list.map((job, position) => ({ ...job, position })));
				})
				.catch(err => {
					reject(err);
				});
		});
	};
}
