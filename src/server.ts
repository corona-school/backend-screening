import config from "./config";
import App from "./app";
import { Context } from "koa";
import LoggerService from "./utils/Logger";
import chalk from "chalk";

const Logger = LoggerService("server.ts");

const app = new App(config);

const handleError = (err: any, ctx: Context) => {
  Logger.error(err, ctx);
};

const terminate = async (signal: string) => {
  try {
    await app.terminate();
  } finally {
    Logger.info("App is terminated");
    process.kill(process.pid, signal);
  }
};

app.listen(config.port, () => {
  Logger.info(
    `backend-screening api listening on ${chalk.yellowBright(
      "http://localhost:" + config.port + "/"
    )} in ${chalk.yellowBright(config.env)}`
  );
});

// Handle uncaught errors
app.on("error", handleError);

process.on("unhandledRejection" as any, handleError);
process.on("uncaughtException" as any, handleError);

process.once("SIGTERM", () => terminate("SIGTERM"));
process.once("SIGINT", () => terminate("SIGINT"));
process.once("SIGUSR2", () => terminate("SIGUSR2"));
