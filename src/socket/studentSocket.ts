import ScreeningService from "../services/screeningService";
import { StudentSubscriber } from "../subscriber/studentSubscriber";
import QueueService from "../services/QueueService";
import { EventEmitter } from "events";
import { onlineScreenerList } from "./screenerSocket";
import LoggerService from "../utils/Logger";
import { getId } from "../utils/jobUtils";
import GenericQueue from "../GenericQueue";
import { ScreenerInfo, StudentData } from "../types/Queue";
const Logger = LoggerService("studentSocket.ts");

export const StudentEmitter = new EventEmitter();

enum StudentSocketEvents {
  LOGIN = "login",
  LOGOUT = "logout",
  RECONNECT = "student-reconnect",
}

export enum StudentEmitterEvents {
  STUDENT_LOGIN = "loginStudent",
}

export enum StudentSocketActions {
  LOGIN = "login",
  UPDATE_JOB = "updateJob",
  REMOVED_JOB = "removedJob",
  UPDATE_SCREENER = "updateScreener",
  FAILED_RECONNECT = "failedReconnect",
}

const screeningService = new ScreeningService();

const allStudents: Map<string, string> = new Map([]);

const findInMap = (map: Map<string, string>, val: string): boolean => {
  for (const [, v] of map) {
    if (v === val) {
      return true;
    }
  }
  return false;
};

export class StudentSocket {
  key: string;
  io: SocketIO.Server;
  newStudentQueue: GenericQueue<StudentData, ScreenerInfo>;

  constructor(io: SocketIO.Server, key: string) {
    this.io = io;
    this.key = key;
    this.newStudentQueue = QueueService.getQueue(key);

    new StudentSubscriber(io, this.newStudentQueue);
    this.initSocket();
  }

  private initSocket = () => {
    this.io.on("connection", (socket: SocketIO.Socket) => {
      socket.on("disconnect", async () => {
        if (allStudents.get(socket.id)) {
          const email = allStudents.get(socket.id);
          Logger.warn(`Student ${email} disconnected.`);
          this.logoutStudent(email, socket.id);
        }
      });

      socket.on(StudentSocketEvents.RECONNECT, async (data) => {
        if (data.email) {
          allStudents.set(socket.id, data.email);
          const job = await this.newStudentQueue.getJobWithPosition(
            getId(data.email)
          );
          if (!job) {
            Logger.warn(
              `Student ${data.email} tried reconnecting but Job is already deleted.`
            );
            this.loginStudent(socket, data.email);
            return;
          }
          Logger.info(`Student ${data.email} reconnected.`);
          socket.join(data.email);
          this.io.sockets
            .in(data.email)
            .emit(StudentSocketActions.UPDATE_JOB, job);
        } else {
          Logger.error(
            `Student tried reconnecting without an email (${socket.id}). Forcing Logout.`
          );
          socket.emit(StudentSocketActions.FAILED_RECONNECT);
        }
      });

      socket.on(StudentSocketEvents.LOGIN, async (data: any) => {
        allStudents.set(socket.id, data.email);
        Logger.info(`New Student Login from ${data.email}`);
        this.loginStudent(socket, data);
      });

      socket.on(StudentSocketEvents.LOGOUT, async () => {
        const email = allStudents.get(socket.id);
        await this.logoutStudent(email, socket.id, true);
      });
    });
  };

  private logoutStudent = async (
    email: string,
    id: string,
    forced = false
  ): Promise<void> => {
    Logger.info(
      `${forced ? "Logging" : "Maybe logging"} out ${email} (id:${id})`
    );
    const jobId = getId(email);
    const job = await this.newStudentQueue.getJobWithPosition(jobId);

    if (job && job.status === "waiting") {
      allStudents.delete(id);
      if (forced) {
        await this.newStudentQueue.remove(jobId);
      } else {
        // remove Job of Queue if email is not in map after 1 minute
        setTimeout(async () => {
          if (!findInMap(allStudents, email)) {
            Logger.warn(`Removing student ${jobId} from queue after 1 Minute`);
            const newJob = await this.newStudentQueue.getJobWithPosition(jobId);
            if (newJob && newJob.status === "waiting") {
              this.newStudentQueue.remove(newJob.id);
            }
          } else {
            Logger.info(
              `Student ${email} successfully reconnected and will not be removed`
            );
          }
        }, 60 * 1000);
      }
    }
  };

  private loginStudent = (socket: SocketIO.Socket, data: any): void => {
    socket.join(data.email);
    screeningService
      .login(data.email, this.key)
      .then((jobInfo) => {
        this.io.sockets
          .in(data.email)
          .emit(StudentSocketActions.LOGIN, { success: true, jobInfo });

        Logger.info(onlineScreenerList.length.toString());

        this.io.sockets
          .in(data.email)
          .emit(StudentSocketActions.UPDATE_SCREENER, {
            screenerCount: onlineScreenerList.length,
          });
      })
      .catch((err) => {
        this.io.sockets
          .in(data.email)
          .emit(StudentSocketActions.LOGIN, { success: false, err });
      });
  };
}
