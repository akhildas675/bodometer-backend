import { HealthLogDto, UpsertHealthLogDto, HealthLogProgressResponseDto } from "../dto/health-log.dto";
import { Timeframe } from "../../../constants/fitness.constant";

export interface IHealthLogService {
  getHealthLog(userId: string, date: string): Promise<HealthLogDto>;
  upsertHealthLog(userId: string, data: UpsertHealthLogDto): Promise<HealthLogDto>;
  getHealthLogProgress(userId: string, timeframe?: Timeframe): Promise<HealthLogProgressResponseDto>;
}
