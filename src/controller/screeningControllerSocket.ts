import ScreeningService from "../service/screeningService";
import { Message } from "../queue";
import { Screener } from "../database/models/Screener";

const screeningService = new ScreeningService();

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
    screeningService.subcriber.on("message", async (channel, data) => {
      const message: Message = JSON.parse(data);
      switch (message.operation) {
        case "addedJob": {
          console.log("added Job");

          break;
        }
        case "changedStatus": {
          const jobInfo = await screeningService.myQueue.getJobWithPosition(
            message.email
          );
          if (!message.screenerEmail) {
            io.sockets.in(message.email).emit("updateJob", jobInfo);
            break;
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
