import ScreeningService from "../services/screeningService";
import { io, newStudentQueue } from "../server";
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
const Logger = LoggerService("studentSubscriber.ts");

const changeStatus = async (
  message: Message<StudentData, ScreenerInfo>
): Promise<void> => {
  const jobList = await newStudentQueue.listInfo();

  for (const jobInfo of jobList) {
    if (jobInfo.data.email === message.jobInfo.data.email) {
      Logger.info(jobInfo.status, jobInfo.data.email);

      io.sockets
        .in(jobInfo.data.email)
        .emit(StudentSocketActions.UPDATE_JOB, jobInfo);
    } else if (jobInfo.status === "waiting") {
      io.sockets
        .in(jobInfo.data.email)
        .emit(StudentSocketActions.UPDATE_JOB, jobInfo);
    }
  }
};

const removeJob = async (
  message: Message<StudentData, ScreenerInfo>
): Promise<void> => {
  Logger.info("removedJob");

  const jobList = await newStudentQueue.listInfo();

  io.sockets
    .in(message.jobInfo.data.email)
    .emit(StudentSocketActions.REMOVED_JOB, message.jobInfo.data.email);
  for (const jobInfo of jobList) {
    if (jobInfo.status === "waiting") {
      Logger.info("updated", jobInfo.data.email);

      io.sockets
        .in(jobInfo.data.id)
        .emit(StudentSocketActions.UPDATE_JOB, jobInfo);
    }
  }
};

interface StudentSubscriber {
  init: (screeningService: ScreeningService) => StudentSubscriber;
  listen: () => void;
}

export const studentSubscriber = {
  listen: (): void => {
    ScreenerEmitter.on(
      screenerEmitterEvents.UPDATE_SCREENER,
      async (screenerCount: number) => {
        const jobList = await newStudentQueue.listInfo();
        Logger.info(
          `Screener List updated to ${screenerCount} active Screener.`
        );
        jobList
          .filter((j) => j.status === "waiting")
          .map((j) =>
            io.sockets
              .in(j.data.email)
              .emit(StudentSocketActions.UPDATE_SCREENER, {
                screenerCount,
              })
          );
      }
    );

    newStudentQueue.on("StudentQueue", async (data) => {
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
          changeStatus(message);
          break;
        }
        case QueueChanges.REMOVED_JOB: {
          Logger.info("Student Subscriber: removed Job");
          removeJob(message);
          break;
        }
      }
    });
  },
};
