import ScreeningService from "../service/screeningService";
import { Message, JobInfo } from "../queue";
import { Screener } from "../database/models/Screener";

const screeningService = new ScreeningService();

const updateStudent = (
  message: Message,
  jobInfo: JobInfo,
  io: SocketIO.Server
) => {
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
const screeningControllerSocket = (io: SocketIO.Server): void => {
  io.on("connection", (socket) => {
    socket.on("login", async (data) => {
      console.log(`New Student Login from ${data.email}`);

      socket.join(data.email);

      const jobInfo = await screeningService.login(data.email);
      if (!jobInfo) {
        io.sockets.in(data.email).emit("login", { success: false });
      }

      io.sockets.in(data.email).emit("login", { success: true, jobInfo });
    });
    socket.on("logout", async (data) => {
      screeningService.logout(data.email);
    });
    screeningService.subcriber.on("message", async (channel, data) => {
      const message: Message = JSON.parse(data);
      switch (message.operation) {
        case "addedJob": {
          console.log("added Job");

          break;
        }
        case "changedStatus": {
          const jobList = await screeningService.myQueue.listInfo();
          for (const jobInfo of jobList) {
            if (jobInfo.email === message.email) {
              updateStudent(message, jobInfo, io);
            } else if (jobInfo.status === "waiting") {
              io.sockets.in(jobInfo.email).emit("updateJob", jobInfo);
            }
          }
          break;
        }
        case "removedJob": {
          console.log("removed Job");
          break;
        }
      }
    });
  });
};

export default screeningControllerSocket;
