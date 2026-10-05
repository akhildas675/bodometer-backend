import { Router } from "express";
import container from "../../../container/container";
import { HEALTH_LOG_TYPES } from "../health-log.types";
import { HealthLogController } from "../controller/health-log.controller";
import { ROLE_GUARD } from "../../../constants/constant.values.ts/role.guard";
import { validate } from "@/middleware/validate";
import { healthLogQuerySchema, upsertHealthLogSchema } from "../validation/health-log.validation";

const healthLogRouter = Router();

const healthLogController = container.get<HealthLogController>(
  HEALTH_LOG_TYPES.HealthLogController
);

healthLogRouter.use(ROLE_GUARD.USER_GUARD);

healthLogRouter.get("/", validate(healthLogQuerySchema), healthLogController.getHealthLog);
healthLogRouter.post("/", validate(upsertHealthLogSchema), healthLogController.upsertHealthLog);
healthLogRouter.get("/progress", validate(healthLogQuerySchema), healthLogController.getHealthLogProgress);

export default healthLogRouter;
