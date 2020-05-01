import schedule from "node-schedule";
import LoggerService from "../utils/Logger";
import { studentQueue } from "../server";
import moment from "moment";

const Logger = LoggerService("cleanup.ts");

// Deletes all completed jobs older than 1 hour
// Runs every 15 minutes
const cleanup = schedule.scheduleJob("*/15 * * * 0-6", async () => {
  try {
    Logger.info("Starting cleanup job..");
    const jobs = await studentQueue.list();
    if (!jobs || jobs.length === 0) {
      Logger.info("No jobs found to cleanup.");
      return;
    }

    for (const job of jobs) {
      if (job.status !== "completed" && job.status !== "rejected") {
        continue;
      }
      if (moment(job.time).isAfter(moment().subtract(1, "hours"))) {
        Logger.info(
          `Job ${job.email} is newer than 1 hour and will not be deleted.`
        );
        continue;
      }
      const duration = moment
        .duration(moment(new Date()).diff(moment(job.time)))
        .asHours();
      Logger.info(
        `Job ${job.email} is ${duration} hours old and will be removed.`
      );
      const success = await studentQueue.remove(job.email);
      if (success) {
        Logger.info(`Removed ${job.email} via cleanup script.`);
      } else {
        Logger.info(`Could not remove ${job.email} via cleanup script.`);
      }
    }
  } catch (err) {
    Logger.error(`An errour occurred in the cleanup script: ${err.message}`);
  }
});

export default cleanup;
