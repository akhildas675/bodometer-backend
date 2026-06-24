import { IHealthLogRepository } from "../interface/health-log-repository.interface";
import { HealthLogModel, IHealthLogModel, IEmbeddedMeal } from "../models/health-log.model";
import mongoose from "mongoose";

export class HealthLogRepository implements IHealthLogRepository {
  async findByUserAndDate(userId: string, date: Date): Promise<IHealthLogModel | null> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return HealthLogModel.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).exec();
  }

  async upsert(userId: string, date: Date, data: Partial<IHealthLogModel>): Promise<IHealthLogModel> {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await HealthLogModel.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existing) {
      if (data.sleepHours !== undefined) existing.sleepHours = data.sleepHours;
      if (data.waterLiters !== undefined) existing.waterLiters = data.waterLiters;
      if (data.steps !== undefined) existing.steps = data.steps;
      if (data.meals !== undefined) {
        existing.meals = data.meals as mongoose.Types.DocumentArray<IEmbeddedMeal>;
        existing.markModified('meals');
      }
      return existing.save();
    } else {
      const newLog = new HealthLogModel({
        userId,
        date: startOfDay, // Normalize to start of day
        sleepHours: data.sleepHours,
        waterLiters: data.waterLiters,
        steps: data.steps,
        meals: data.meals || [],
      });
      return newLog.save();
    }
  }

  async findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IHealthLogModel[]> {
    const start = new Date(startDate);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setUTCHours(23, 59, 59, 999);

    return HealthLogModel.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 }).exec();
  }
}
