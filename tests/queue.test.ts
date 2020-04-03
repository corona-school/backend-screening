import redis from "redis";
import RedisMock from "redis-mock";
jest.spyOn(redis, "createClient").mockImplementation(RedisMock.createClient);
import Queue, { Job, ScreenerInfo } from "../src/queue";

describe("Testing queue functionality", () => {
  const myQueue = new Queue("StudentQueue");
  const time = Date.now();
  const job: Job = {
    firstname: "Max",
    lastname: "Müller",
    email: "max@müller.de",
    jitsi: "some_link",
    subjects: [],
    time,
    status: "waiting",
  };

  const screenerInfo: ScreenerInfo = {
    firstname: "Leon",
    lastname: "Erath",
    email: "leon-erath@hotmail.de",
    time,
  };

  it("can add a job to the queue", async () => {
    const addedJob = await myQueue.add(job);

    expect(addedJob).toEqual({
      firstname: "Max",
      lastname: "Müller",
      email: "max@müller.de",
      jitsi: "some_link",
      subjects: [],
      time,
      status: "waiting",
      position: 1,
    });
  });
  it("can list all jobs from the queue", async () => {
    await myQueue.reset();
    await myQueue.add(job);

    const list = await myQueue.list();

    expect(list).toEqual([
      {
        firstname: "Max",
        jitsi: "some_link",
        email: "max@müller.de",
        lastname: "Müller",
        status: "waiting",
        subjects: [],
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
        subjects: [],
        position: 1,
        time,
      },
    ]);
  });
  it("can remove a job from the queue", async () => {
    const hasRemoved = await myQueue.remove(job.email);
    expect(hasRemoved).toBe(true);
  });
  it("can change the status of a job from the queue", async () => {
    const addedJob = await myQueue.add(job);
    const changedJob = await myQueue.changeJob(
      job.email,
      { status: "active" },
      screenerInfo
    );
    expect(changedJob).toEqual({
      firstname: "Max",
      lastname: "Müller",
      email: "max@müller.de",
      jitsi: "some_link",
      time,
      status: "active",
      subjects: [],
      position: 1,
      screener: {
        firstname: "Leon",
        lastname: "Erath",
        email: "leon-erath@hotmail.de",
        time,
      },
    });
  });
  it("can reset the jobs from the queue", async () => {
    const list = await myQueue.reset();
    expect(list).toEqual([]);
  });
  it("can get the info from a job of the queue", async () => {
    await myQueue.reset();
    await myQueue.add(job);
    const foundJob = await myQueue.getJobWithPosition(job.email);
    expect(foundJob).toEqual({
      firstname: "Max",
      lastname: "Müller",
      email: "max@müller.de",
      jitsi: "some_link",
      time,
      status: "waiting",
      position: 1,
      subjects: [],
    });
  });
});
