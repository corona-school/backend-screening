import ScreeningService from "../services/screeningService";
import {
  Message,
  QueueChanges,
  StudentData,
  ScreenerInfo,
} from "../types/Queue";
import {
  ScreenerEmitter,
  screenerEmitterEvents,
} from "../socket/screenerSocket";
import { StudentSocketActions } from "../socket/studentSocket";
import LoggerService from "../utils/Logger";
import GenericQueue from "../GenericQueue";
const Logger = LoggerService("studentSubscriber.ts");

export class StudentSubscriber {
  queue: GenericQueue<StudentData, ScreenerInfo>;
  io: SocketIO.Server;

  constructor(
    io: SocketIO.Server,
    queue: GenericQueue<StudentData, ScreenerInfo>
  ) {
    this.queue = queue;
    this.io = io;
    this.listen();
  }
  private listen = () => {
    ScreenerEmitter.on(
      screenerEmitterEvents.UPDATE_SCREENER,
      async (screenerCount: number) => {
        const jobList = await this.queue.listInfo();
        Logger.info(
          `Screener List updated to ${screenerCount} active Screener.`
        );
        jobList
          .filter((j) => j.status === "waiting")
          .map((j) =>
            this.io.sockets
              .in(j.data.email)
              .emit(StudentSocketActions.UPDATE_SCREENER, {
                screenerCount,
              })
          );
      }
    );

    this.queue.on("StudentQueue", async (data) => {
      if (!data) {
        Logger.warn("Message without data recieved");
        return;
      }

      const message: Message<StudentData, ScreenerInfo> = JSON.parse(data);

      switch (message.operation) {
        case QueueChanges.ADDED_JOB: {
          Logger.info("Student Subscriber: added Job");
          break;
        }
        case QueueChanges.CHANGED_STATUS: {
          Logger.info("Student Subscriber: changed Status");
          this.changeStatus(message);
          break;
        }
        case QueueChanges.REMOVED_JOB: {
          Logger.info("Student Subscriber: removed Job");
          this.removeJob(message);
          break;
        }
      }
    });
  };

  private changeStatus = async (
    message: Message<StudentData, ScreenerInfo>
  ): Promise<void> => {
    const jobList = await this.queue.listInfo();

    for (const jobInfo of jobList) {
      if (
        jobInfo.status === "waiting" ||
        jobInfo.data.email === message.jobInfo.data.email
      ) {
        this.io.sockets
          .in(jobInfo.data.email)
          .emit(StudentSocketActions.UPDATE_JOB, jobInfo);
      }
    }
  };

  private removeJob = async (
    message: Message<StudentData, ScreenerInfo>
  ): Promise<void> => {
    Logger.info("removedJob");

    const jobList = await this.queue.listInfo();

    this.io.sockets
      .in(message.jobInfo.data.email)
      .emit(StudentSocketActions.REMOVED_JOB, message.jobInfo.data.email);
    for (const jobInfo of jobList) {
      if (jobInfo.status === "waiting") {
        Logger.info("updated", jobInfo.data.email);

        this.io.sockets
          .in(jobInfo.data.id)
          .emit(StudentSocketActions.UPDATE_JOB, jobInfo);
      }
    }
  };
}
