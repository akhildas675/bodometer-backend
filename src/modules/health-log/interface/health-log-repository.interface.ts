import { IHealthLogModel } from "../models/health-log.model";

export interface IHealthLogRepository {
  findByUserAndDate(userId: string, date: Date): Promise<IHealthLogModel | null>;
  upsert(userId: string, date: Date, data: Partial<IHealthLogModel>): Promise<IHealthLogModel>;
  findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IHealthLogModel[]>;
}
