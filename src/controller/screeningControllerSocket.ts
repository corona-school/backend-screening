import ScreeningService from "../service/screeningService";
import { Message, JobInfo } from "../queue";
import { Screener } from "../database/models/Screener";

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

const allStudents: Map<string, string> = new Map([]);
const screeningControllerSocket = (io: SocketIO.Server): void => {
  io.on("connection", (socket) => {
    socket.on("disconnect", async () => {
      const email = allStudents.get(socket.id);
      const job = await screeningService.myQueue.getJobWithPosition(email);
      if (job && job.status !== "completed" && job.status !== "rejected") {
        allStudents.delete(socket.id);
        await screeningService.myQueue.remove(email);
      }
      console.log(`Student ${email} logged out!`);
    });
    socket.on("login", async (data) => {
      allStudents.set(socket.id, data.email);
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
    subcriber.on("message", async (channel, data) => {
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
              console.log(jobInfo.status, jobInfo.email);

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
