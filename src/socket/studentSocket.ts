import ScreeningService from "../service/screeningService";
import { studentSubscriber } from "../subscriber/studentSubscriber";
import { io, studentQueue } from "../server";
import { EventEmitter } from "events";
import { onlineScreenerList } from "./screenerSocket";

export const StudentEmitter = new EventEmitter();

enum StudentSocketEvents {
  LOGIN = "login",
  LOGOUT = "logout",
}

export enum StudentEmitterEvents {
  STUDENT_LOGIN = "loginStudent",
}

export enum StudentSocketActions {
  LOGIN = "login",
  UPDATE_JOB = "updateJob",
  REMOVED_JOB = "removedJob",
  UPDATE_SCREENER = "updateScreener",
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

export const logoutStudent = async (
  email: string,
  id: string,
  forced = false
): Promise<void> => {
  console.log("Try loggin out", email, id, forced);

  const job = await studentQueue.getJobWithPosition(email);

  if (job && job.status === "waiting") {
    allStudents.delete(id);
    if (forced) {
      await studentQueue.remove(email);
    } else {
      setTimeout(() => {
        if (!findInMap(allStudents, email)) {
          studentQueue.remove(email);
        }
      }, 1000);
    }
  }
};

const loginStudent = (socket: SocketIO.Socket, data: any): void => {
  socket.join(data.email);
  screeningService
    .login(data.email)
    .then((jobInfo) => {
      io.sockets
        .in(data.email)
        .emit(StudentSocketActions.LOGIN, { success: true, jobInfo });

      console.log(onlineScreenerList.length);

      io.sockets.in(data.email).emit(StudentSocketActions.UPDATE_SCREENER, {
        screenerCount: onlineScreenerList.length,
      });
    })
    .catch(() => {
      io.sockets
        .in(data.email)
        .emit(StudentSocketActions.LOGIN, { success: false });
    });
};

export const startStudentSocket = () => {
  studentSubscriber.init(screeningService).listen();

  io.on("connection", (socket: SocketIO.Socket) => {
    socket.on("disconnect", async () => {
      if (allStudents.get(socket.id)) {
        const email = allStudents.get(socket.id);
        logoutStudent(email, socket.id);
      }
    });

    socket.on(StudentSocketEvents.LOGIN, async (data: any) => {
      allStudents.set(socket.id, data.email);
      console.log(`New Student Login from ${data.email}`);
      loginStudent(socket, data);
    });

    socket.on(StudentSocketEvents.LOGOUT, async () => {
      const email = allStudents.get(socket.id);
      await logoutStudent(email, socket.id, true);
    });
  });
};
