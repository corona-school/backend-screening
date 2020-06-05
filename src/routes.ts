import Router from "koa-router";
import {
  OpenHoursController,
  QueueController,
  StudentController,
  ScreenerController,
  StatisticsController,
} from "./controller";
import { requireAuth } from "./auth";
import { DefaultState, Context } from "koa";

const router = new Router<DefaultState, Context>();
router.get("/", async (ctx) => {
  ctx.body = "Hello World";
  ctx.status = 200;
});

router.get("/ping", async (ctx) => {
  ctx.body = "pong";
  ctx.status = 200;
});

// Opening Hours
router.get("/openingHours", OpenHoursController.getOpeningHours);
router.post(
  "/openingHours",
  requireAuth,
  OpenHoursController.changeOpeningHours
);

// QueueController
router.post("/queue/reset", requireAuth, QueueController.resetQueue);
router.get("/queue/jobs", requireAuth, QueueController.listJobs);

// StudentController
router.post("/student/login", StudentController.login);
router.post("/student/logout", StudentController.logout);
router.post("/student/remove", requireAuth, StudentController.remove);
router.get("/student", requireAuth, StudentController.get);
router.get("/student/jobInfo", StudentController.getInfo);
router.post("/student/verify", StudentController.verify);
router.post("/student/changeJob", requireAuth, StudentController.changeJob);

// ScreenerRouter
router.post("/screener/create", requireAuth, ScreenerController.create);
router.get("/screener/status", ScreenerController.getStatus);
router.post("/screener/login", ScreenerController.login);
router.get("/screener/logout", ScreenerController.logout);
router.get("/screener/info", requireAuth, ScreenerController.getInfo);

// StatisticsRouter
router.get("/statistics/logs", requireAuth, StatisticsController.getLogs);
router.get("/queue/statistics", StatisticsController.getStatistics);

export default router;
