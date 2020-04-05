import ScreeningService from "../service/screeningService";
import { Message, JobInfo } from "../queue";
import { Screener, getScreener } from "../database/models/Screener";

const screeningService = new ScreeningService();

const subcriber = screeningService.myQueue.getClient().duplicate();
subcriber.subscribe("queue");

const updateStudent = (
  message: Message,
  jobInfo: JobInfo,
  io: SocketIO.Server
): void => {
  if (!message.screenerEmail) {
    io.sockets.in(message.email).emit("updateJob", jobInfo);
    return;
  }

  Screener.findOne({
    where: {
      email: message.screenerEmail,
    },
  })
    .then((screener) => {
      const answer = {
        ...jobInfo,
        screener: {
          firstname: screener.firstname,
          lastname: screener.lastname,
        },
      };
      io.sockets.in(message.email).emit("updateJob", answer);
    })
    .catch((err) => {
      console.error(err);
      io.sockets.in(message.email).emit("updateJob", jobInfo);
    });
};

interface ScreenerInfo {
  firstname: string;
  lastname: string;
  email: string;
}

const allStudents: Map<string, string> = new Map([]);
const allScreener: Map<string, string> = new Map([]);
let onlineScreenerList: ScreenerInfo[] = [];
const isStudent: Map<string, boolean> = new Map([]);

const findInMap = (map: Map<string, string>, val: string) => {
  for (const [k, v] of map) {
    if (v === val) {
      return true;
    }
  }
  return false;
};

const logoutStudent = async (
  email: string,
  id: string,
  forced = false
): Promise<void> => {
  console.log("Try loggin out", email, id, forced);

  const job = await screeningService.myQueue.getJobWithPosition(email);

  if (job && job.status === "waiting") {
    allStudents.delete(id);
    if (forced) {
      await screeningService.myQueue.remove(email);
    } else {
      setTimeout(() => {
        if (!findInMap(allStudents, email)) {
          screeningService.myQueue.remove(email);
        }
      }, 1000);
    }
  }
};

const screeningControllerSocket = (io: SocketIO.Server): void => {
  const addScreener = (screener: ScreenerInfo): void => {
    if (!onlineScreenerList.some((s) => s.email === screener.email)) {
      onlineScreenerList.push(screener);
    }
    io.sockets.in("screener").emit("screenerUpdate", onlineScreenerList);
  };

  const removeScreener = (email: string): void => {
    const newList: ScreenerInfo[] = [];
    for (const screener of onlineScreenerList) {
      if (screener.email !== email) {
        newList.push(screener);
      }
    }
    onlineScreenerList = newList;
    io.sockets.in("screener").emit("screenerUpdate", newList);
  };

  io.on("connection", (socket) => {
    socket.on("loginScreener", async (data) => {
      if (!data) {
        return;
      }
      isStudent.set(socket.id, false);
      allScreener.set(socket.id, data.email);

      const jobList = await screeningService.myQueue.listInfo();
      socket.join("screener");
      socket.emit("updateQueue", jobList);
      addScreener(data);

      console.log(`New Screener Login from ${data.email}`);
    });

    socket.on("disconnect", async () => {
      if (isStudent.get(socket.id) && allStudents.get(socket.id)) {
        const email = allStudents.get(socket.id);
        logoutStudent(email, socket.id);
      }
      if (!isStudent.get(socket.id) && allScreener.get(socket.id)) {
        const email = allScreener.get(socket.id);
        allScreener.delete(socket.id);
        removeScreener(email);
      }
    });

    socket.on("login", async (data) => {
      allStudents.set(socket.id, data.email);
      isStudent.set(socket.id, true);
      console.log(`New Student Login from ${data.email}`);

      socket.join(data.email);

      screeningService
        .login(data.email)
        .then((jobInfo) => {
          io.sockets.in(data.email).emit("login", { success: true, jobInfo });
        })
        .catch((err) => {
          io.sockets.in(data.email).emit("login", { success: false });
        });
    });

    socket.on("logout", async (data) => {
      const email = allStudents.get(socket.id);
      await logoutStudent(email, socket.id, true);
    });

    socket.on("logoutScreener", async (data) => {
      allScreener.delete(socket.id);
      removeScreener(data.email);
      console.log(`Screener ${data.email} logged out!`);
    });
  });
  subcriber.on("message", async (channel, data) => {
    const message: Message = JSON.parse(data);

    switch (message.operation) {
      case "addedJob": {
        console.log("added Job");
        const jobList = await screeningService.myQueue.listInfo();
        io.sockets.in("screener").emit("updateQueue", jobList);
        break;
      }
      case "changedStatus": {
        const jobList = await screeningService.myQueue.listInfo();
        io.sockets.in("screener").emit("updateQueue", jobList);
        for (const jobInfo of jobList) {
          if (jobInfo.email === message.email) {
            console.log(jobInfo.status, jobInfo.email);

            updateStudent(message, jobInfo, io);
          } else if (jobInfo.status === "waiting") {
            io.sockets.in(jobInfo.email).emit("updateJob", jobInfo);
          }
        }
        break;
      }
      case "removedJob": {
        console.log("removedJob");

        const jobList = await screeningService.myQueue.listInfo();
        io.sockets.in("screener").emit("updateQueue", jobList);

        io.sockets.in(message.email).emit("removedJob", message.email);
        for (const jobInfo of jobList) {
          if (jobInfo.status === "waiting") {
            console.log("updated", jobInfo.email);

            io.sockets.in(jobInfo.email).emit("updateJob", jobInfo);
          }
        }
        break;
      }
    }
  });
};

export default screeningControllerSocket;
