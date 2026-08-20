import { Container } from "inversify";
import { HEALTH_METRICS_TYPES } from "./health-metrics.types";
import { IHealthMetrics } from "./interface/health.metrics-service.interface";
import { HealthMetricsService } from "@/services/health.metrics/health-metrics.service";

export const loadHealthMetricsBindings = (container: Container): void => {
  container.bind<IHealthMetrics>(HEALTH_METRICS_TYPES.HealthMetricsService).to(HealthMetricsService);
};
