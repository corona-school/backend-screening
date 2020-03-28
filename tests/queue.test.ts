import redis from "redis";
import RedisMock from "redis-mock";
jest.spyOn(redis, "createClient").mockImplementation(RedisMock.createClient);
import Queue, { Job } from "../src/queue";

describe("Testing queue functionality", () => {
  const myQueue = new Queue("", "StudentQueue");
  const time = Date.now();
  const job: Job = {
    firstname: "Max",
    lastname: "Müller",
    email: "max@müller.de",
    jitsi: "some_link",
    time,
    status: "waiting",
  };

  it("can add a job to the queue", async () => {
    const addedJob = await myQueue.add(job);

    expect(addedJob).toEqual({
      firstname: "Max",
      lastname: "Müller",
      email: "max@müller.de",
      jitsi: "some_link",
      time,
      status: "waiting",
      position: 0,
    });
  });
  it("can list all jobs from the queue", async () => {
    await myQueue.reset();
    await myQueue.add(job);

    const list = await myQueue.list();
    console.log(list);

    expect(list).toEqual([
      {
        firstname: "Max",
        jitsi: "some_link",
        email: "max@müller.de",
        lastname: "Müller",
        status: "waiting",
        time,
      },
    ]);
  });
  it("can list all jobs with info from the queue", async () => {
    await myQueue.reset();
    await myQueue.add(job);

    const list = await myQueue.listInfo();

    expect(list).toEqual([
      {
        firstname: "Max",
        jitsi: "some_link",
        email: "max@müller.de",
        lastname: "Müller",
        status: "waiting",
        position: 0,
        time,
      },
    ]);
  });
  it("can remove a job from the queue", async () => {
    await myQueue.add(job);
    const hasRemoved = await myQueue.remove(job.email);
    expect(hasRemoved).toBe(true);
  });
  it("can change the status of a job from the queue", async () => {
    await myQueue.add(job);
    const changedJob = await myQueue.changeStatus(job.email, "active");
    expect(changedJob).toEqual({
      firstname: "Max",
      lastname: "Müller",
      email: "max@müller.de",
      jitsi: "some_link",
      time,
      status: "active",
      position: 0,
    });
  });
  it("can reset the jobs from the queue", async () => {
    await myQueue.add(job);
    const list = await myQueue.reset();
    expect(list).toEqual([]);
  });
  it("can get the info from a job of the queue", async () => {
    await myQueue.add(job);
    const foundJob = await myQueue.getJobWithPosition(job.email);
    expect(foundJob).toEqual({
      firstname: "Max",
      lastname: "Müller",
      email: "max@müller.de",
      jitsi: "some_link",
      time,
      status: "waiting",
      position: 0,
    });
  });
});
