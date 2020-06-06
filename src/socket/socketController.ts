import { ScreenerSocket } from "./screenerSocket";
import { StudentSocket } from "./studentSocket";

const SocketController = (io: SocketIO.Server, key: string) => {
  new StudentSocket(io, key);
  new ScreenerSocket(io, key);
};

export default SocketController;
