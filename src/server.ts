import http from "http";
import socket from "socket.io";

import config from "./config";
import App from "./app";
import GenericQueue from "./GenericQueue";
import { StudentData, ScreenerInfo } from "./types/Queue";
import { sequelize } from "./database";
import cleanup from "./jobs/cleanup";

const app = new App(config);

function handleError(err: any, ctx: any) {
  console.error(err, ctx);
}

async function terminate(signal: string) {
  try {
    await app.terminate();
  } finally {
    console.info({ signal, event: "terminate" }, "App is terminated");
    process.kill(process.pid, signal);
  }
}

// Handle uncaught errors
app.on("error", handleError);

export const newStudentQueue = new GenericQueue<StudentData, ScreenerInfo>(
  "StudentQueue",
  config.redisUrl
);

const server = http.createServer(app.callback());
export const io: SocketIO.Server = socket(server);

// Start server

sequelize
  .sync()
  .then(() => {
    server.listen(config.port, () => {
      console.info(
        `API server listening on http://localhost:${config.port}/ in ${config.env}`
      );
    });
  })
  .catch((err) => {
    cleanup.cancel();
  });

server.on("error", handleError);

const errors: any[] = ["unhandledRejection", "uncaughtException"];
errors.map((error) => {
  process.on(error, handleError);
});

const signals: any[] = ["SIGTERM", "SIGINT", "SIGUSR2"];
signals.map((signal) => {
  process.once(signal, () => terminate(signal));
});
