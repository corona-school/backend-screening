import redis from "redis";
import redis_mock from "redis-mock";
jest.spyOn(redis, "createClient").mockImplementation(redis_mock.createClient);
import Queue, { Job } from "../src/queue";

describe("Testing queue functionality", () => {
	it("add job to queue", async () => {
		const myQueue = new Queue("");
		const time = Date.now();
		const job: Job = {
			firstname: "Max",
			lastname: "Müller",
			email: "max@müller.de",
			jitsi: "some_link",
			time,
			status: "waiting"
		};
		const addedJob = await myQueue.add(job);

		expect(addedJob).toEqual({
			firstname: "Max",
			lastname: "Müller",
			email: "max@müller.de",
			jitsi: "some_link",
			time,
			status: "waiting",
			position: 0
		});
	});
});
