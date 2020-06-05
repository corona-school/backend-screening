import GenericQueue, { JobInfo } from "../src/GenericQueue";
import { ScreenerInfo, StudentData } from "../src/types/Queue";

const TIMESTAMP = 123456;
const dateSpy = jest.spyOn(Date, "now");
dateSpy.mockReturnValue(TIMESTAMP);

const myQueue = new GenericQueue<StudentData, ScreenerInfo>("StudentQueue");

beforeEach(async () => {
  await myQueue.reset(true);
});

describe("Testing Student-Screener-Queue:", () => {
  const screenerInfo: ScreenerInfo = {
    firstname: "Leon",
    lastname: "Erath",
    email: "leon-erath@hotmail.de",
  };

  const data: StudentData = {
    id: "alskdmalkdmqw",
    firstname: "Max",
    lastname: "Müller",
    email: "max@müller.de",
    jitsi: "some_link",
    subjects: [],
  };
  const data2: StudentData = {
    ...data,
    id: "alksmdalksdma",
  };

  const data3: StudentData = {
    ...data,
    id: "alksmdalksqweqw",
  };

  const makeJob = (
    data: StudentData,
    options?: Partial<JobInfo<StudentData, ScreenerInfo>>
  ): JobInfo<StudentData, ScreenerInfo> => ({
    id: data.id,
    data,
    status: "waiting",
    timeWaiting: TIMESTAMP,
    position: 0,
    ...options,
  });

  it("can add jobs", async () => {
    const addedJob = await myQueue.add(data.id, data);
    expect(addedJob).toEqual(makeJob(data));

    const addedJob2 = await myQueue.add(data2.id, data2);
    expect(addedJob2).toEqual(makeJob(data2, { position: 1 }));

    const addedJob3 = await myQueue.add(data3.id, data3);
    expect(addedJob3).toEqual(makeJob(data3, { position: 2 }));
  });

  it("can set a job to active", async () => {
    const addedJob = await myQueue.add(data.id, data);

    const changedJob = await myQueue.changeJob(
      addedJob.id,
      data,
      screenerInfo,
      "SET_ACTIVE"
    );

    expect(changedJob).toEqual(
      makeJob(data, {
        assignedTo: screenerInfo,
        status: "active",
        timeActive: TIMESTAMP,
      })
    );
  });
  it("can set a job to active and then completed", async () => {
    const addedJob = await myQueue.add(data.id, data);

    const changedJob = await myQueue.changeJob(
      addedJob.id,
      data,
      screenerInfo,
      "SET_ACTIVE"
    );

    expect(changedJob).toEqual(
      makeJob(data, {
        assignedTo: screenerInfo,
        status: "active",
        timeActive: TIMESTAMP,
      })
    );

    const changedJob2 = await myQueue.changeJob(
      addedJob.id,
      data,
      screenerInfo,
      "SET_DONE"
    );

    expect(changedJob2).toEqual(
      makeJob(data, {
        assignedTo: screenerInfo,
        status: "completed",
        timeActive: TIMESTAMP,
        timeDone: TIMESTAMP,
      })
    );
  });

  it("can set a job to active and then completed", async () => {
    const addedJob = await myQueue.add(data.id, data);

    const changedJob = await myQueue.changeJob(
      addedJob.id,
      data,
      screenerInfo,
      "SET_ACTIVE"
    );

    expect(changedJob).toEqual(
      makeJob(data, {
        assignedTo: screenerInfo,
        status: "active",
        timeActive: TIMESTAMP,
      })
    );

    const changedJob2 = await myQueue.changeJob(
      addedJob.id,
      data,
      screenerInfo,
      "SET_REJECTED"
    );

    expect(changedJob2).toEqual(
      makeJob(data, {
        assignedTo: screenerInfo,
        status: "rejected",
        timeActive: TIMESTAMP,
        timeDone: TIMESTAMP,
      })
    );
  });
});

afterAll(async (done) => {
  myQueue.disconnect();
  done();
});
