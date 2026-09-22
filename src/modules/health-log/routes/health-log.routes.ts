import { Router } from "express";
import container from "../../../container/container";
import { HEALTH_LOG_TYPES } from "../health-log.types";
import { HealthLogController } from "../controller/health-log.controller";
import { ROLE_GUARD } from "../../../constants/constant.values.ts/role.guard";

const healthLogRouter = Router();

const healthLogController = container.get<HealthLogController>(
  HEALTH_LOG_TYPES.HealthLogController
);

healthLogRouter.use(ROLE_GUARD.USER_GUARD);

healthLogRouter.get(
  "/",
  healthLogController.getHealthLog
);

healthLogRouter.post(
  "/",
  healthLogController.upsertHealthLog
);

healthLogRouter.get(
  "/progress",
  healthLogController.getHealthLogProgress
);

export default healthLogRouter;
