import { EventEmitter } from "events";
import QueueService from "../services/QueueService";
import LoggerService from "../utils/Logger";
import GenericQueue from "../GenericQueue";
import { StudentData, ScreenerInfo } from "../types/Queue";
const Logger = LoggerService("screenerSocket.ts");

export const ScreenerEmitter = new EventEmitter();

enum screenerSocketEvents {
  LOGIN = "loginScreener",
  LOGOUT = "logoutScreener",
}

export enum screenerEmitterEvents {
  UPDATE_SCREENER = "screenerUpdate",
  STUDENT_LOGIN = "studentLogin",
}

enum screenerSocketActions {
  UPDATE_QUEUE = "updateQueue",
  UPDATE_SCREENER = "screenerUpdate",
}

const SCREENER_CHANNEL = "screener";

interface ScreenerStatusInfo {
  firstname: string;
  lastname: string;
  email: string;
  active: boolean;
}

const allScreener: Map<string, string> = new Map([]);
export let onlineScreenerList: ScreenerStatusInfo[] = [];

export class ScreenerSocket {
  io: SocketIO.Server;
  newStudentQueue: GenericQueue<StudentData, ScreenerInfo>;

  constructor(io: SocketIO.Server, key: string) {
    this.io = io;
    this.newStudentQueue = QueueService.getQueue(key);
    this.initializeSocket();
  }

  private initializeSocket = () => {
    this.io.on("connection", (socket) => {
      socket.on(
        screenerSocketEvents.LOGIN,
        async (data: ScreenerStatusInfo) => {
          if (!data) {
            return;
          }

          allScreener.set(socket.id, data.email);

          const jobList = await this.newStudentQueue.listInfo();

          socket.join(SCREENER_CHANNEL);

          // send current status of Jobs to Screener
          socket.emit(screenerSocketActions.UPDATE_QUEUE, jobList);
          this.addScreener(data);

          Logger.info(`New Screener Login from ${data.email}`);
        }
      );

      socket.on("disconnect", async () => {
        if (allScreener.get(socket.id)) {
          const email = allScreener.get(socket.id);
          allScreener.delete(socket.id);
          this.removeScreener(email);
          Logger.info(`Screener ${email} disconnected.`);
        }
      });
      socket.on("screenerStatus", async (data: ScreenerStatusInfo) => {
        onlineScreenerList = onlineScreenerList.map((s) => {
          if (s.email === data.email) {
            Logger.info(
              `Changing Status of Screener ${data.email} from ${s.active} to ${data.active}`
            );
            return data;
          }
          return s;
        });
        // notify Students in Queue
        ScreenerEmitter.emit(
          screenerEmitterEvents.UPDATE_SCREENER,
          onlineScreenerList.filter((s) => s.active).length
        );
        this.io.sockets
          .in(SCREENER_CHANNEL)
          .emit(screenerSocketActions.UPDATE_SCREENER, onlineScreenerList);
      });
      socket.on("screener-reconnect", async (data) => {
        if (!data) {
          return;
        }

        allScreener.set(socket.id, data.email);

        const jobList = await this.newStudentQueue.listInfo();
        socket.join(SCREENER_CHANNEL);
        // send current status of Jobs to Screener
        socket.emit(screenerSocketActions.UPDATE_QUEUE, jobList);
        this.addScreener(data);

        Logger.info(`Screener ${data.email} reconnected.`);
      });

      socket.on(
        screenerSocketEvents.LOGOUT,
        async (data: ScreenerStatusInfo) => {
          allScreener.delete(socket.id);
          this.removeScreener(data.email);
          Logger.info(`Screener ${data.email} logged out!`);
        }
      );
    });

    this.newStudentQueue.on("StudentQueue", async () => {
      // screener is notified in everytime when the queue changes (we dont need to check what changed)
      const jobList = await this.newStudentQueue.listInfo();
      this.io.sockets
        .in(SCREENER_CHANNEL)
        .emit(screenerSocketActions.UPDATE_QUEUE, jobList);
    });
  };

  private addScreener = (screener: ScreenerStatusInfo): void => {
    if (!onlineScreenerList.some((s) => s.email === screener.email)) {
      onlineScreenerList.push(screener);
    }

    ScreenerEmitter.emit(
      screenerEmitterEvents.UPDATE_SCREENER,
      onlineScreenerList.filter((s) => s.active).length
    );
    this.io.sockets
      .in(SCREENER_CHANNEL)
      .emit(screenerSocketActions.UPDATE_SCREENER, onlineScreenerList);
  };

  private removeScreener = (email: string): void => {
    const newList: ScreenerStatusInfo[] = [];
    for (const screener of onlineScreenerList) {
      if (screener.email !== email) {
        newList.push(screener);
      }
    }

    onlineScreenerList = newList;

    // notify Students in Queue
    ScreenerEmitter.emit(
      screenerEmitterEvents.UPDATE_SCREENER,
      newList.filter((s) => s.active).length
    );
    this.io.sockets
      .in(SCREENER_CHANNEL)
      .emit(screenerSocketActions.UPDATE_SCREENER, newList);
  };
}
