import { Container } from "inversify";
import { HEALTH_LOG_TYPES } from "./health-log.types";
import { HealthLogController } from "./controller/health-log.controller";
import { IHealthLogService } from "./interface/health-log-service.interface";
import { HealthLogService } from "./service/health-log.service";
import { IHealthLogRepository } from "./interface/health-log-repository.interface";
import { HealthLogRepository } from "./repositories/health-log.repository";

export const loadHealthLogBindings = (container: Container) => {
    container.bind<HealthLogController>(HEALTH_LOG_TYPES.HealthLogController).to(HealthLogController);
    container.bind<IHealthLogService>(HEALTH_LOG_TYPES.HealthLogService).to(HealthLogService);
    container.bind<IHealthLogRepository>(HEALTH_LOG_TYPES.HealthLogRepository).to(HealthLogRepository);
};
