import winston from "winston";
import chalk from "chalk";

const LoggerService = (fileName: string) =>
  winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.align(),
      winston.format.printf((info) => {
        const { timestamp, level, message, ...args } = info;

        return `${timestamp} | ${chalk.bgGray(
          fileName
        )} [${level}]: ${message.trim()} ${
          Object.keys(args).length ? JSON.stringify(args, null, 2) : ""
        }`;
      })
    ),

    transports: [new winston.transports.Console()],
  });

export default LoggerService;
