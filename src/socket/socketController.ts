import startScreenerSocket, { screenerEmitterEvents } from "./screenerSocket";
import { startStudentSocket } from "./studentSocket";
const SocketController = () => {
  startScreenerSocket();
  startStudentSocket();
};

export default SocketController;
