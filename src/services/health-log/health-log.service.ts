import { IHealthLogService } from "../../interfaces/service-interface/health-log/health-log-service.interface";
import { IHealthLogRepository } from "../../interfaces/repository-interface/health-log/health-log-repository.interface";
import { IUserSubscriptionRepository } from "../../interfaces/repository-interface/subscription/user.subscription.repository.interface";
import { AiHealthService, MealMacroEstimate } from "../ai-services/ai-health.service";
import {
  HealthLogDto,
  UpsertHealthLogDto,
  HealthLogProgressResponseDto,
  HealthLogTrendDataDto,
  MacroDistributionDto,
  DailyNutritionSummaryDto,
} from "../../dto/health-log/health-log.dto";
import { TIMEFRAME, Timeframe } from "../../constants/fitness.constant";
import { IHealthLogModel, IEmbeddedMeal } from "../../models/health-log.model";
import mongoose from "mongoose";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";

export class HealthLogService implements IHealthLogService {
  constructor(
    private _healthLogRepo: IHealthLogRepository,
    private _aiHealthService: AiHealthService,
    private _userSubscriptionRepo: IUserSubscriptionRepository
  ) { }

  async getHealthLog(userId: string, dateStr: string): Promise<HealthLogDto> {
    const date = new Date(dateStr);
    const log = await this._healthLogRepo.findByUserAndDate(userId, date);

    if (!log) {
      return {
        userId,
        date: dateStr,
        meals: [],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }

    return this.mapToDto(log, dateStr);
  }

  async upsertHealthLog(userId: string, data: UpsertHealthLogDto): Promise<HealthLogDto> {
    const date = new Date(data.date);
    
    // Validate target date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      throw new AppError(STATUS.BAD_REQUEST, "Cannot log meals for future dates.");
    }

    // Validate target date is not before subscription started
    const activeSub = await this._userSubscriptionRepo.findActiveByUserId(userId);
    if (!activeSub) {
      throw new AppError(STATUS.BAD_REQUEST, "No active subscription found.");
    }

    const subStart = new Date(activeSub.startDate);
    subStart.setHours(0, 0, 0, 0);
    if (date < subStart) {
      throw new AppError(STATUS.BAD_REQUEST, "Cannot log meals before your subscription start date.");
    }

    const existingLog = await this._healthLogRepo.findByUserAndDate(userId, date);

    const processedMeals: IEmbeddedMeal[] = [];


    const mealsToEstimate: { index: number; description: string }[] = [];

    for (let i = 0; i < data.meals.length; i++) {
      const mealDto = data.meals[i];
      const existingMeal = existingLog?.meals.find(
        (m) => m.mealCategoryId.toString() === mealDto.mealCategoryId
      );

      let requiresAi = false;
      if (!existingMeal || existingMeal.description !== mealDto.description) {
        requiresAi = true;
      }

      if (requiresAi && mealDto.description.trim()) {
        mealsToEstimate.push({ index: i, description: mealDto.description });
      }
    }

    // estimate macros
    let batchEstimates: MealMacroEstimate[] = [];
    if (mealsToEstimate.length > 0) {
      try {
        batchEstimates = await this._aiHealthService.estimateBatchMealMacros(
          mealsToEstimate.map(m => m.description)
        );
      } catch (error) {
        console.error("AI Batch Estimation failed:", error);
      }
    }

    //  processed meals
    for (let i = 0; i < data.meals.length; i++) {
      const mealDto = data.meals[i];
      const existingMeal = existingLog?.meals.find(
        (m) => m.mealCategoryId.toString() === mealDto.mealCategoryId
      );

      let estimatedCalories = existingMeal?.estimatedCalories || 0;
      let estimatedProtein = existingMeal?.estimatedProtein || 0;
      let estimatedCarbs = existingMeal?.estimatedCarbs || 0;
      let estimatedFat = existingMeal?.estimatedFat || 0;
      let correctedMeal = existingMeal?.correctedMeal || mealDto.description;

      const estimateIndex = mealsToEstimate.findIndex(m => m.index === i);
      if (estimateIndex !== -1 && batchEstimates[estimateIndex]) {
        const est = batchEstimates[estimateIndex];
        estimatedCalories = est.estimatedCalories;
        estimatedProtein = est.estimatedProtein;
        estimatedCarbs = est.estimatedCarbs;
        estimatedFat = est.estimatedFat;
        correctedMeal = est.correctedMeal;
      }

      processedMeals.push({
        mealCategoryId: new mongoose.Types.ObjectId(mealDto.mealCategoryId),
        description: mealDto.description,
        correctedMeal,
        estimatedCalories,
        estimatedProtein,
        estimatedCarbs,
        estimatedFat,
      });
    }

    const savedLog = await this._healthLogRepo.upsert(userId, date, {
      sleepHours: data.sleepHours,
      waterLiters: data.waterLiters,
      steps: data.steps,
      meals: processedMeals,
    });

    return this.mapToDto(savedLog, data.date);
  }

  private mapToDto(log: IHealthLogModel, dateStr: string): HealthLogDto {
    const meals = log.meals.map(m => ({
      mealCategoryId: m.mealCategoryId.toString(),
      description: m.description,
      correctedMeal: m.correctedMeal,
      estimatedCalories: m.estimatedCalories,
      estimatedProtein: m.estimatedProtein,
      estimatedCarbs: m.estimatedCarbs,
      estimatedFat: m.estimatedFat,
    }));

    return {
      userId: log.userId.toString(),
      date: dateStr,
      sleepHours: log.sleepHours,
      waterLiters: log.waterLiters,
      steps: log.steps,
      meals,
      totalCalories: meals.reduce((s, m) => s + (m.estimatedCalories ?? 0), 0),
      totalProtein: meals.reduce((s, m) => s + (m.estimatedProtein ?? 0), 0),
      totalCarbs: meals.reduce((s, m) => s + (m.estimatedCarbs ?? 0), 0),
      totalFat: meals.reduce((s, m) => s + (m.estimatedFat ?? 0), 0),
    };
  }


  async getHealthLogProgress(userId: string, timeframe: Timeframe = TIMEFRAME.DAILY): Promise<HealthLogProgressResponseDto> {
    const endDate = new Date();
    endDate.setUTCHours(23, 59, 59, 999);

    const startDate = new Date();


    if (timeframe === TIMEFRAME.DAILY) {
      startDate.setDate(endDate.getDate() - 6);
    } else if (timeframe === TIMEFRAME.WEEKLY) {
      startDate.setDate(endDate.getDate() - 29);
    } else {
      startDate.setMonth(endDate.getMonth() - 11);
    }
    startDate.setUTCHours(0, 0, 0, 0);

    const logs = await this._healthLogRepo.findByUserAndDateRange(userId, startDate, endDate);

    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
    let totalWater = 0, totalSleep = 0, totalSteps = 0;

    const groupedLogs = new Map<string, {
      calories: number; protein: number; water: number; sleep: number; steps: number;
    }>();

    for (const log of logs) {
      const d = new Date(log.date);
      let key = "";

      if (timeframe === TIMEFRAME.DAILY) {

        key = d.toLocaleDateString("en-US", { weekday: "short" });
      } else if (timeframe === TIMEFRAME.WEEKLY) {
        // "30 May", "31 May" …  (one bar per actual day over 30 days)
        key = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      } else {
        // "Jan", "Feb" …
        key = d.toLocaleDateString("en-US", { month: "short" });
      }

      const logCals = log.meals.reduce((s, m) => s + (m.estimatedCalories || 0), 0);
      const logProtein = log.meals.reduce((s, m) => s + (m.estimatedProtein || 0), 0);
      const logCarbs = log.meals.reduce((s, m) => s + (m.estimatedCarbs || 0), 0);
      const logFat = log.meals.reduce((s, m) => s + (m.estimatedFat || 0), 0);

      totalCalories += logCals;
      totalProtein += logProtein;
      totalCarbs += logCarbs;
      totalFat += logFat;
      totalWater += (log.waterLiters || 0);
      totalSleep += (log.sleepHours || 0);
      totalSteps += (log.steps || 0);

      const g = groupedLogs.get(key) ?? { calories: 0, protein: 0, water: 0, sleep: 0, steps: 0 };
      g.calories += logCals;
      g.protein += logProtein;
      g.water += (log.waterLiters || 0);
      g.sleep += (log.sleepHours || 0);
      g.steps += (log.steps || 0);
      groupedLogs.set(key, g);
    }

    // ordered trendData
    const trendData: HealthLogTrendDataDto[] = [];

    if (timeframe === TIMEFRAME.DAILY) {
      // 7 day 
      for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        const g = groupedLogs.get(label) ?? { calories: 0, protein: 0, water: 0, sleep: 0, steps: 0 };
        trendData.push({ label, ...g });
      }
    } else if (timeframe === TIMEFRAME.WEEKLY) {
      // 30 day 
      for (let i = 29; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        const g = groupedLogs.get(label) ?? { calories: 0, protein: 0, water: 0, sleep: 0, steps: 0 };
        trendData.push({ label, ...g });
      }
    } else {
      // 12 month 
      for (let i = 11; i >= 0; i--) {
        const d = new Date(endDate);
        d.setMonth(d.getMonth() - i);
        const label = d.toLocaleDateString("en-US", { month: "short" });
        const g = groupedLogs.get(label) ?? { calories: 0, protein: 0, water: 0, sleep: 0, steps: 0 };
        trendData.push({ label, ...g });
      }
    }

    // Summary averages
    const count = logs.length || 1;
    const round1 = (n: number) => Math.round(n * 10) / 10;
    const averageCalories = Math.round(totalCalories / count);
    const averageProtein = Math.round(totalProtein / count);
    const averageSteps = Math.round(totalSteps / count);
    const averageWater = round1(totalWater / count);
    const averageSleep = round1(totalSleep / count);

    // Streak
    let streak = 0;
    const todayMidnight = new Date();
    todayMidnight.setUTCHours(0, 0, 0, 0);

    let checkDate = new Date(todayMidnight);
    const hasLog = (d: Date) =>
      logs.some(l => new Date(l.date).getTime() === d.getTime());

    // if today not logged, start from yesterday
    if (!hasLog(checkDate)) checkDate.setDate(checkDate.getDate() - 1);

    while (hasLog(checkDate)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    //  macro distribution pie chart
    const totalMacroGrams = totalProtein + totalCarbs + totalFat || 1;
    const macroDistribution: MacroDistributionDto[] = [
      { macroName: "Protein", amount: Math.round(totalProtein / count), percentage: Math.round((totalProtein / totalMacroGrams) * 100) },
      { macroName: "Carbs", amount: Math.round(totalCarbs / count), percentage: Math.round((totalCarbs / totalMacroGrams) * 100) },
      { macroName: "Fat", amount: Math.round(totalFat / count), percentage: Math.round((totalFat / totalMacroGrams) * 100) },
    ];

    // daily nutrition summary today or most-recent day
    let dailySummary: DailyNutritionSummaryDto | null = null;

    const todayLog = logs.find(l => new Date(l.date).getTime() === todayMidnight.getTime());
    const targetLog = todayLog ?? (logs.length > 0 ? logs[logs.length - 1] : null);

    if (targetLog) {
      dailySummary = {
        date: new Date(targetLog.date).toISOString().split("T")[0],
        totalCalories: targetLog.meals.reduce((s, m) => s + (m.estimatedCalories || 0), 0),
        totalProtein: targetLog.meals.reduce((s, m) => s + (m.estimatedProtein || 0), 0),
        totalCarbs: targetLog.meals.reduce((s, m) => s + (m.estimatedCarbs || 0), 0),
        totalFat: targetLog.meals.reduce((s, m) => s + (m.estimatedFat || 0), 0),
      };
    }

    return {
      averageCalories,
      averageProtein,
      averageSleep,
      averageWater,
      averageSteps,
      currentStreak: streak,
      trendData,
      macroDistribution,
      dailySummary,
    };
  }
}
