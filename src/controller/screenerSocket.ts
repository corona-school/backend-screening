import { io, studentQueue } from "../server";

enum screenerSocketEvents {
  LOGIN = "loginScreener",
  LOGOUT = "logoutScreener",
}

enum screenerSocketActions {
  UPDATE_QUEUE = "updateQueue",
  UPDATE_SCREENER = "screenerUpdate",
}

const SCREENER_CHANNEL = "screener";

interface ScreenerInfo {
  firstname: string;
  lastname: string;
  email: string;
}

const allScreener: Map<string, string> = new Map([]);
let onlineScreenerList: ScreenerInfo[] = [];

const startScreenerSocket = (): void => {
  const subcriber = studentQueue.getClient().duplicate();
  subcriber.subscribe("queue");

  const addScreener = (screener: ScreenerInfo): void => {
    if (!onlineScreenerList.some((s) => s.email === screener.email)) {
      onlineScreenerList.push(screener);
    }
    io.sockets
      .in(SCREENER_CHANNEL)
      .emit(screenerSocketActions.UPDATE_SCREENER, onlineScreenerList);
  };

  const removeScreener = (email: string): void => {
    const newList: ScreenerInfo[] = [];
    for (const screener of onlineScreenerList) {
      if (screener.email !== email) {
        newList.push(screener);
      }
    }
    onlineScreenerList = newList;
    io.sockets
      .in(SCREENER_CHANNEL)
      .emit(screenerSocketActions.UPDATE_SCREENER, newList);
  };

  io.on("connection", (socket) => {
    socket.on(screenerSocketEvents.LOGIN, async (data) => {
      if (!data) {
        return;
      }

      allScreener.set(socket.id, data.email);

      const jobList = await studentQueue.listInfo();
      socket.join(SCREENER_CHANNEL);
      socket.emit(screenerSocketActions.UPDATE_QUEUE, jobList);
      addScreener(data);

      console.log(`New Screener Login from ${data.email}`);
    });

    socket.on("disconnect", async () => {
      if (allScreener.get(socket.id)) {
        const email = allScreener.get(socket.id);
        allScreener.delete(socket.id);
        removeScreener(email);
      }
    });

    socket.on(screenerSocketEvents.LOGOUT, async (data) => {
      allScreener.delete(socket.id);
      removeScreener(data.email);
      console.log(`Screener ${data.email} logged out!`);
    });
  });
  subcriber.on("message", async () => {
    // screener is notified in everytime when the queue changes (we dont need to check what changed)
    const jobList = await studentQueue.listInfo();
    io.sockets
      .in(SCREENER_CHANNEL)
      .emit(screenerSocketActions.UPDATE_QUEUE, jobList);
  });
};

export default startScreenerSocket;
