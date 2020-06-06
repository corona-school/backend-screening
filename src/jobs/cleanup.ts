import schedule from "node-schedule";
import LoggerService from "../utils/Logger";
import moment from "moment";
import GenericQueue from "../GenericQueue";

const Logger = LoggerService("cleanup.ts");

// Deletes all completed jobs older than 1 hour
// Runs every 15 minutes
const startQueueCleanup = <D, S>(newStudentQueue: GenericQueue<D, S>) => {
  schedule.scheduleJob("*/15 * * * 0-6", async () => {
    try {
      Logger.info("Starting cleanup job..");
      const jobs = await newStudentQueue.list();
      if (!jobs || jobs.length === 0) {
        Logger.info("No jobs found to cleanup.");
        return;
      }

      for (const job of jobs) {
        if (job.status !== "completed" && job.status !== "rejected") {
          continue;
        }
        if (!job.timeDone) {
          continue;
        }
        if (moment(job.timeDone).isAfter(moment().subtract(1, "hours"))) {
          Logger.info(
            `Job ${job.id} is newer than 1 hour and will not be deleted.`
          );
          continue;
        }
        const duration = moment
          .duration(moment(new Date()).diff(moment(job.timeDone)))
          .asHours();
        Logger.info(
          `Job ${job.id} is ${duration} hours old and will be removed.`
        );

        await newStudentQueue.remove(job.id);

        Logger.info(`Removed ${job.id} via cleanup script.`);
      }
    } catch (err) {
      Logger.error(`An errour occurred in the cleanup script: ${err.message}`);
    }
  });
};

export default startQueueCleanup;
