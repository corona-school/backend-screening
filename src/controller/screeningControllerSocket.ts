import ScreeningService from "../service/screeningService";

const screeningService = new ScreeningService();

const screeningControllerSocket = (io: SocketIO.Server): void => {
  io.on("connection", (socket) => {
    console.log("connected");
    socket.on("login", async (data) => {
      socket.join(data.email);
      console.log(data.email);
      const jobInfo = await screeningService.login(data.email);
      if (!jobInfo) {
        io.sockets.in(data.email).emit("login", { success: false });
      }
      io.sockets.in(data.email).emit("login", { success: true, jobInfo });
    });
  });
};

export default screeningControllerSocket;
