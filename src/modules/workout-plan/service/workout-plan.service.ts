import mongoose from "mongoose";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/constant.values.ts/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { WorkoutMapper } from "../mapper/workout-plan.mapper";
import { AiWorkoutService } from "../../../services/ai-services/ai-workout.service";
import { IUserWorkoutPlanRepository } from "../interface/user-workout-plan-repository.interface";
import { IAnswerRepository } from "../../../modules/onboarding/interface/repository.interface/answer-repository.interface";
import { IExerciseRepository } from '@/modules/exercise/interface/exercise-repository.interface';
import {
  WORKOUT_DAY_TYPE, 
  WORKOUT_DAY_STATUS, 
  WORKOUT_PLAN_STATUS, 
  WORKOUT_EXERCISE_STATUS, 
  TIMEFRAME, 
  Timeframe, 
  PLAN_TYPE,
} from "@/constants/constant.values.ts/fitness.constant";
import { IEmbeddedWorkoutDay, IEmbeddedWorkoutExercise } from "../models/user.workout-plan.model";
import { 
  WorkoutPlanDetailDto, 
  WorkoutPlanResponseDto, 
  GetWorkoutPlansResponseDto, 
  WorkoutProgressResponseDto, 
  AiWorkoutExerciseDto, 
  RecentActivityDto, 
  MarkDayCompletedDto, 
  MarkExerciseStatusDto,
  CompletedHistoryItemDto
} from "../dto/workout-plan.dto";
import { IUserSubscriptionRepository } from "../../subscription/interface/repository.interface/user.subscription.repository.interface";
import { SUBSCRIPTION_TYPES } from "../../subscription/subscription.types";
import { inject, injectable } from "inversify";
import { WORKOUT_PLAN_TYPES } from "../workout-plan.types";
import { IWorkoutPlanService } from "../interface/workout-plan-service.interface";

import { USER_TYPES } from "@/modules/user/user.types";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

import { AI_TYPES } from "@/modules/ai/ai.types";
import { IAiWorkoutService } from "@/modules/ai/interface/ai.workout-service.interface";

const generationLocks = new Set<string>();
@injectable()
export class WorkoutPlanService implements IWorkoutPlanService {
  constructor(
    @inject(WORKOUT_PLAN_TYPES.UserWorkoutPlanRepository) private _userWorkoutPlanRepo: IUserWorkoutPlanRepository,
    @inject(Symbol.for("ExerciseRepository")) private _exerciseRepo: IExerciseRepository,
    @inject(Symbol.for("AnswerRepository")) private _answerRepo: IAnswerRepository,
    @inject(SUBSCRIPTION_TYPES.UserSubscriptionRepository) private _userSubscriptionRepo: IUserSubscriptionRepository,
    @inject(NOTIFICATION_TYPES.NotificationService) private _notificationService: INotificationService,
    @inject(USER_TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(AI_TYPES.AiWorkoutService) private _aiWorkoutService: IAiWorkoutService,
  ) {}

  private async getActiveSubscription(userId: string) {
    const subscription = await this._userSubscriptionRepo.findActiveByUserId(userId);
    return subscription ? true : false;
  }

  async generateWorkout(userId: string): Promise<WorkoutPlanDetailDto> {
    const hasActiveSub = await this.getActiveSubscription(userId);
    const planType = hasActiveSub ? PLAN_TYPE.PREMIUM : PLAN_TYPE.FREE;
    if (generationLocks.has(userId)) {
      throw new AppError(STATUS.CONFLICT, MESSAGES.WORKOUT_PLAN.GENERATION_CONFLICT);
    }
    generationLocks.add(userId);

    try {
      const onboardingAnswers = await this._answerRepo.getUserAnswers(userId);
      
      if (planType === PLAN_TYPE.PREMIUM) {
      if (!onboardingAnswers || !onboardingAnswers.completed) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.WORKOUT_PLAN.ONBOARDING_REQUIRED);
      }
    }

    const { generationStatus } = await this.getWorkoutPlans(userId);

    if (!generationStatus.canGenerate) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.WORKOUT_PLAN.GENERATE_LOCKED);
    }

    const answersMap: Record<string, string | string[]> = {};
    if (onboardingAnswers) {
      for (const ans of onboardingAnswers.answers) {
        if (ans.questionKey) {
          answersMap[ans.questionKey] = ans.answer as string | string[];
        }
      }
    }

    const activeExercises = await this._exerciseRepo.findAll({ isActive: true });

    const exerciseDataMap = new Map(
      activeExercises.map((ex) => [
        ex._id?.toString() ?? "",
        { title: ex.title, image: ex.media?.image ?? "" },
      ]),
    );

    const userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
    
    
    const samePlanTypeDocs = userDocs.filter(doc => doc.planType === planType);
    const previousPlansCount = samePlanTypeDocs.length;

    let completedWorkoutDaysTotal = 0;
    for (const week of samePlanTypeDocs) {
      for (const day of week.workoutDays) {
        if (day.status === WORKOUT_DAY_STATUS.COMPLETED) {
          completedWorkoutDaysTotal++;
        }
      }
    }

    const availableExercises = activeExercises.map((ex) => ({
      id: ex._id ? ex._id.toString() : "",
      key: ex.key,
      title: ex.title,
      difficulty: ex.difficulty,
      isCompound: ex.isCompound,
      workoutEnvironments: ex.workoutEnvironments,
    }));

    // Only look at past 4 weeks of the same plan type for history
    const past4Weeks = samePlanTypeDocs.slice(-4).map(week => ({
      weekNumber: week.weekNumber,
      status: week.status,
      workoutDays: week.workoutDays.map((day) => ({
        dayNumber: day.dayNumber,
        type: day.type,
        status: day.status,
        exercises: day.exercises.map((ex) => {
          const exData = exerciseDataMap.get(ex.exerciseId.toString());
          return {
            exerciseTitle: exData?.title ?? "Unknown Exercise",
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.durationSeconds,
            status: ex.status,
            timeTakenSeconds: ex.timeTakenSeconds
          };
        })
      }))
    }));

    const aiResponse = await this._aiWorkoutService.generateWorkoutPlan({
      planType,
      answers: answersMap,
      availableExercises,
      previousPlansCount,
      completedWorkoutDaysTotal,
      past4WeeksData: past4Weeks,
    });


    await this._userWorkoutPlanRepo.expireActiveWeeks(userId);

    const embeddedDays: IEmbeddedWorkoutDay[] = aiResponse.weekPlan.map((dayData, i) => {
      const embeddedExercises: IEmbeddedWorkoutExercise[] = dayData.exercises.map((ex: AiWorkoutExerciseDto) => {
        return {
          instanceId: ex.instanceId!,
          exerciseId: new mongoose.Types.ObjectId(ex.exerciseId),
          order: ex.order,
          targetMuscles: ex.targetMuscles || [],
          sets: ex.sets,
          reps: ex.reps,
          durationSeconds: ex.durationSeconds,
          estimatedDurationSeconds: ex.estimatedDurationSeconds,
          restSeconds: ex.restSeconds,
          notes: ex.notes,
        };
      });

      const dayScheduledDate = new Date();
      dayScheduledDate.setDate(dayScheduledDate.getDate() + i);

      return {
        dayNumber: i + 1,
        dayName: dayData.day,
        scheduledDate: dayScheduledDate,
        type: dayData.type.toUpperCase() === WORKOUT_DAY_TYPE.WORKOUT
          ? WORKOUT_DAY_TYPE.WORKOUT
          : WORKOUT_DAY_TYPE.REST,
        focus: dayData.focus,
        estimatedDurationMinutes: dayData.estimatedDurationMinutes,
        status: WORKOUT_DAY_STATUS.PENDING,
        exercises: embeddedExercises,
      };
    });

    const weekNumber = previousPlansCount + 1;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const updatedDoc = await this._userWorkoutPlanRepo.createWeek(userId, {
      planType,
      weekNumber,
      startDate,
      endDate,
      status: WORKOUT_PLAN_STATUS.ACTIVE,
      workoutDays: embeddedDays,
    });

      const userDoc = await this._userRepository.findById(userId);
      const result = WorkoutMapper.toWorkoutPlanDetailDto(updatedDoc, exerciseDataMap);
      this._notificationService.createNotification({
        recipientId: userId,
        type: NOTIFICATION_TYPE.WORKOUT_PLAN_GENERATED,
        entityType: NOTIFICATION_ENTITY_TYPE.WORKOUT,
        entityId: updatedDoc._id.toString(),
        variables: {
          userName: userDoc?.name || "User",
          workoutType: planType === PLAN_TYPE.PREMIUM ? "Premium" : "Free",
        },
      }).catch((err) => console.error("Notification error:", err));
      return result;
    } finally {
      generationLocks.delete(userId);
    }
  }

  async getWorkoutPlans(userId: string, preventAutoGenerate: boolean = false): Promise<GetWorkoutPlansResponseDto> {
    const hasActiveSub = await this.getActiveSubscription(userId);
    const planType = hasActiveSub ? PLAN_TYPE.PREMIUM : PLAN_TYPE.FREE;
    const isPremium = hasActiveSub;
    let userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
    
  
    if (userDocs) {
      const targetPlanType = isPremium ? PLAN_TYPE.PREMIUM : PLAN_TYPE.FREE;
      userDocs = userDocs.filter(doc => doc.planType === targetPlanType);
    }

    if (userDocs && userDocs.length > 0) {
      const activeDoc = userDocs.find(doc => doc.status === WORKOUT_PLAN_STATUS.ACTIVE);
      const now = new Date();
      if (activeDoc && new Date(activeDoc.endDate) < now && !preventAutoGenerate) {
   
        await this.generateWorkout(userId);
        const allDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
        const targetPlanType = isPremium ? PLAN_TYPE.PREMIUM : PLAN_TYPE.FREE;
        userDocs = allDocs.filter(doc => doc.planType === targetPlanType);
      }
    }
    if (!userDocs || userDocs.length === 0) {
      return {
        plans: [],
        generationStatus: {
          canGenerate: true,
          isInactive: false,
          pendingDaysCount: 0,
          hasCompletedWorkoutToday: false,
          firstPendingDayNumber: -1
        },
        isPremium: isPremium || false,
        completedHistory: []
      };
    }

    const sortedWeeks = [...userDocs].sort((a, b) => b.weekNumber - a.weekNumber);

    const exerciseIds = new Set<string>();
    sortedWeeks.forEach(week => {
      week.workoutDays.forEach((day) => {
        day.exercises.forEach((ex) => exerciseIds.add(ex.exerciseId.toString()));
      });
    });

    const exercises = await this._exerciseRepo.findByIds(Array.from(exerciseIds));

    const exerciseDataMap = new Map(
      exercises.map((ex) => {
        return [ex._id?.toString() ?? "", { title: ex.title, image: ex.media?.image ?? "", muscles: ex.targetMuscles }];
      })
    );

    const plans = sortedWeeks.map((week) => WorkoutMapper.toWorkoutPlanResponseDto(week, exerciseDataMap));

    const latestPlan = plans[0];
    let mostRecentCompleted: Date | null = null;
    for (const plan of plans) {
      for (const day of plan.days) {
        if (day.status === WORKOUT_DAY_STATUS.COMPLETED && day.completedAt) {
          const d = new Date(day.completedAt);
          if (!mostRecentCompleted || d.getTime() > mostRecentCompleted.getTime()) {
            mostRecentCompleted = d;
          }
        }
      }
    }

    let hasCompletedWorkoutToday = false;
    const todayStr = new Date().toDateString();

    if (mostRecentCompleted) {
      hasCompletedWorkoutToday = mostRecentCompleted.toDateString() === todayStr;
    }

    const allDaysFinished = latestPlan ? latestPlan.days.every((d) => d.status === WORKOUT_DAY_STATUS.COMPLETED || d.status === WORKOUT_DAY_STATUS.SKIPPED) : true;
    const pendingDaysCount = latestPlan ? latestPlan.days.filter((d) => d.status === WORKOUT_DAY_STATUS.PENDING).length : 0;
    
    const nowTime = new Date().getTime();
    const isExpired = latestPlan && new Date(latestPlan.endDate).getTime() < nowTime;
    const isLatestActive = latestPlan && latestPlan.status === WORKOUT_PLAN_STATUS.ACTIVE && !isExpired;
    
    const canGenerate = isLatestActive ? allDaysFinished : true;

    let firstPendingDayNumber = -1;
    if (latestPlan) {
      const pendingDay = latestPlan.days.find((d) => d.status === WORKOUT_DAY_STATUS.PENDING);
      firstPendingDayNumber = pendingDay ? pendingDay.dayNumber : -1;
    }

    const allDays: CompletedHistoryItemDto[] = [];
    plans.forEach((plan) => {
      plan.days.forEach((day) => {
        if (day.status === WORKOUT_DAY_STATUS.COMPLETED && day.completedAt) {
          allDays.push({
            date: new Date(day.completedAt),
            planWeek: plan.weekNumber,
            day,
          });
        }
      });
    });
    const completedHistory = allDays.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      plans,
      generationStatus: {
        canGenerate,
        isInactive: false,
        pendingDaysCount,
        hasCompletedWorkoutToday,
        firstPendingDayNumber
      },
      isPremium: isPremium || false,
      completedHistory
    };
  }

  async markDayCompleted({ userId, dayNumber, completed }: MarkDayCompletedDto): Promise<WorkoutPlanResponseDto> {
    const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
    if (!activeWeek) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }
    
    if (activeWeek.planType === PLAN_TYPE.FREE) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.WORKOUT_PLAN.PREMIUM_REQUIRED);
    }

    const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.DAY_NOT_FOUND);
    }

    day.status = completed ? WORKOUT_DAY_STATUS.COMPLETED : WORKOUT_DAY_STATUS.PENDING;
    day.completedAt = completed ? new Date() : undefined;
    if (day.exercises && day.exercises.length > 0) {
      day.exercises.forEach((ex) => {
        ex.status = completed ? WORKOUT_EXERCISE_STATUS.COMPLETED : WORKOUT_EXERCISE_STATUS.PENDING;
        if (completed && !ex.timeTakenSeconds) {
          ex.timeTakenSeconds = ex.durationSeconds ?? 60;
        }
      });
    }

    await this._userWorkoutPlanRepo.saveWeek(activeWeek);

    if (completed) {
      const userDoc = await this._userRepository.findById(userId);
      this._notificationService.createNotification({
        recipientId: userId,
        type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
        entityType: NOTIFICATION_ENTITY_TYPE.WORKOUT,
        entityId: activeWeek._id.toString(),
        variables: {
          userName: userDoc?.name || "User",
          workoutName: day.dayName || `Day ${dayNumber}`,
        },
      }).catch((err) => console.error("Notification error:", err));
    }

    const plansResponse = await this.getWorkoutPlans(userId);
    const updatedPlan = plansResponse.plans.find((p) => p.workoutPlanId === activeWeek._id.toString());
    if (!updatedPlan) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.WORKOUT_PLAN.UPDATE_FAILED);
    return updatedPlan;
  }

  async markExerciseStatus({ userId, dayNumber, instanceId, status }: MarkExerciseStatusDto): Promise<WorkoutPlanResponseDto> {
    const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
    if (!activeWeek) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    if (activeWeek.planType === PLAN_TYPE.FREE) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.WORKOUT_PLAN.PREMIUM_REQUIRED);
    }

    const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.DAY_NOT_FOUND);
    }

    const exercise = day.exercises.find((e) => e.instanceId === instanceId);
    if (!exercise) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.EXERCISE_NOT_FOUND);
    }

    if (status === WORKOUT_EXERCISE_STATUS.ACTIVE) {
      const isAnyActive = activeWeek.workoutDays.some((d) =>
        d.exercises.some((e) => e.status === WORKOUT_EXERCISE_STATUS.ACTIVE && e.instanceId !== instanceId)
      );

      if (isAnyActive) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.WORKOUT_PLAN.EXERCISE_IN_PROGRESS);
      }

      exercise.startedAt = new Date();
    } else if (status === WORKOUT_EXERCISE_STATUS.COMPLETED) {
      if (exercise.startedAt) {
        const diffSeconds = Math.floor((Date.now() - exercise.startedAt.getTime()) / 1000);
        const maxDuration = 900;
        exercise.timeTakenSeconds = Math.min(diffSeconds, maxDuration);
      } else {
        exercise.timeTakenSeconds = exercise.durationSeconds ?? 60;
      }
    }

    exercise.status = status;

    const allExercisesFinished = day.exercises.length > 0 && day.exercises.every((e) => e.status === WORKOUT_EXERCISE_STATUS.COMPLETED || e.status === WORKOUT_EXERCISE_STATUS.SKIPPED);

    day.status = allExercisesFinished ? WORKOUT_DAY_STATUS.COMPLETED : WORKOUT_DAY_STATUS.PENDING;
    day.completedAt = allExercisesFinished ? new Date() : undefined;

    await this._userWorkoutPlanRepo.saveWeek(activeWeek);

    const plansResponse = await this.getWorkoutPlans(userId);
    const updatedPlan = plansResponse.plans.find((p) => p.workoutPlanId === activeWeek._id.toString());
    if (!updatedPlan) throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.WORKOUT_PLAN.UPDATE_FAILED);
    return updatedPlan;
  }

  async getWorkoutProgress(userId: string, timeframe?: Timeframe): Promise<WorkoutProgressResponseDto> {
    const isPremium = await this.getActiveSubscription(userId);
  
    const plansResponse = await this.getWorkoutPlans(userId);
    return this.calculateWorkoutProgress(plansResponse.plans, timeframe);
  }

  private calculateWorkoutProgress(plans: WorkoutPlanResponseDto[], timeframe: Timeframe = TIMEFRAME.WEEKLY): WorkoutProgressResponseDto {
    if (!plans || plans.length === 0) {
      return {
        currentStreak: 0,
        completionRate: 0,
        workoutsCompleted: 0,
        totalTrainingMinutes: 0,
        progressBar: { title: "", goalLabel: "", value: 0, valueLabel: "0%" },
        pieChart: { labels: ['No Data', ''], values: [1, 0] },
        trendData: [],
        muscleDistribution: [],
        recentActivities: [],
      };
    }

    const activePlan = plans.find(p => p.status === WORKOUT_PLAN_STATUS.ACTIVE);

    let totalPlanned = 0;
    let totalCompleted = 0;
    let totalTrainingSeconds = 0;

    const recentActivities: RecentActivityDto[] = [];
    const muscleMap = new Map<string, number>();

    const trendData: { label: string; completionRate: number }[] = [];

    if (timeframe === TIMEFRAME.DAILY && activePlan) {
     
      for (const day of activePlan.days) {
        if (day.type === 'workout') {
          const rate = day.status === WORKOUT_DAY_STATUS.COMPLETED ? 100 : 0;
          trendData.push({
            label: day.day, 
            completionRate: rate
          });
        }
      }
    } else if (timeframe === TIMEFRAME.WEEKLY) {
      // Weekly trend
      const weeklyTrends = plans.map(p => {
        const wDays = p.days.filter((d) => d.type === 'workout');
        const wCompleted = wDays.filter((d) => d.status === WORKOUT_DAY_STATUS.COMPLETED).length;
        return {
          label: `Week ${p.weekNumber}`,
          completionRate: wDays.length > 0 ? Math.round((wCompleted / wDays.length) * 100) : 0
        };
      }).reverse().slice(-5);
      trendData.push(...weeklyTrends);
    } else if (timeframe === TIMEFRAME.MONTHLY) {
      // Monthly trend
      const monthlyMap = new Map<string, { planned: number, completed: number }>();
      for (const plan of plans) {
        if (plan.startDate) {
          const monthName = new Date(plan.startDate).toLocaleString('default', { month: 'short' });
          const entry = monthlyMap.get(monthName) || { planned: 0, completed: 0 };
          const wDays = plan.days.filter((d) => d.type === 'workout');
          const wCompleted = wDays.filter((d) => d.status === WORKOUT_DAY_STATUS.COMPLETED).length;
          entry.planned += wDays.length;
          entry.completed += wCompleted;
          monthlyMap.set(monthName, entry);
        }
      }
      const monthlyTrends = Array.from(monthlyMap.entries()).map(([monthName, data]) => ({
        label: monthName,
        completionRate: data.planned > 0 ? Math.round((data.completed / data.planned) * 100) : 0
      })).reverse().slice(-6);
      trendData.push(...monthlyTrends);
    }

    // timeframe
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const startOfToday = today.getTime();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    
    const startOfMonth = new Date(today);
    startOfMonth.setDate(startOfMonth.getDate() - 30);
    let totalCompletedExercises = 0;
    let totalSkippedExercises = 0;

    for (const plan of plans) {
      for (const day of plan.days) {
        if (day.type !== 'workout') continue;

        let includeDay = true;
        if (day.scheduledDate) {
          const dDate = new Date(day.scheduledDate);
          dDate.setHours(0, 0, 0, 0);
          const time = dDate.getTime();

          if (timeframe === TIMEFRAME.DAILY) {
            includeDay = time === startOfToday;
          } else if (timeframe === TIMEFRAME.WEEKLY) {
            includeDay = time >= startOfWeek.getTime() && time <= startOfToday;
          } else if (timeframe === TIMEFRAME.MONTHLY) {
            includeDay = time >= startOfMonth.getTime() && time <= startOfToday;
          }
        }

        if (includeDay) {
          totalPlanned++;
          if (day.status === WORKOUT_DAY_STATUS.COMPLETED) {
            totalCompleted++;
            const activityDate = day.scheduledDate || day.completedAt;
            if (activityDate) {
              recentActivities.push({
                scheduledDate: activityDate,
                dayName: day.day,
                status: day.status
              });
            }
          }

          for (const ex of day.exercises) {
            if (ex.status === WORKOUT_EXERCISE_STATUS.COMPLETED) {
              totalCompletedExercises++;
              if (ex.timeTakenSeconds) {
                totalTrainingSeconds += ex.timeTakenSeconds;
              }

              if (ex.targetMuscles && ex.targetMuscles.length > 0) {
                for (const muscle of ex.targetMuscles) {
                  muscleMap.set(muscle, (muscleMap.get(muscle) || 0) + 1);
                }
              } else {
                muscleMap.set('General', (muscleMap.get('General') || 0) + 1);
              }
            } else if (ex.status === WORKOUT_EXERCISE_STATUS.SKIPPED) {
              totalSkippedExercises++;
            }
          }
        }
      }
    }

    // Active Week Progress
    let currentWeekProgress = 0;
    let todayWorkoutProgress = 0;
    if (activePlan) {
      const wDays = activePlan.days.filter((d) => d.type === 'workout');
      const wCompleted = wDays.filter((d) => d.status === WORKOUT_DAY_STATUS.COMPLETED).length;
      currentWeekProgress = wDays.length > 0 ? Math.round((wCompleted / wDays.length) * 100) : 0;

      // workout
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      let targetDay = activePlan.days.find((d) => {
        if (!d.scheduledDate) return false;
        const dDate = new Date(d.scheduledDate);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === todayDate.getTime();
      });

      if (!targetDay || targetDay.type !== 'workout') {
        targetDay = activePlan.days.find((d) => d.type === 'workout' && d.status === WORKOUT_DAY_STATUS.PENDING);
      }

      if (targetDay && targetDay.exercises && targetDay.exercises.length > 0) {
        const completedEx = targetDay.exercises.filter((ex) => ex.status === WORKOUT_EXERCISE_STATUS.COMPLETED).length;
        todayWorkoutProgress = Math.round((completedEx / targetDay.exercises.length) * 100);
      } else if (targetDay && targetDay.status === WORKOUT_DAY_STATUS.COMPLETED) {
        todayWorkoutProgress = 100;
      }
    }

    // Current Streak Calculation
    let currentStreak = 0;
    const allDays = plans.flatMap(p => p.days).filter((d) => d.scheduledDate).sort((a, b) => new Date(b.scheduledDate!).getTime() - new Date(a.scheduledDate!).getTime());
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(todayDate);
    let foundBreak = false;

    while (!foundBreak) {
      const targetTime = currentDate.getTime();
      const dayForDate = allDays.find((d) => {
        const dTime = new Date(d.scheduledDate!).setHours(0, 0, 0, 0);
        return dTime === targetTime;
      });

      if (!dayForDate) {
        break;
      }

      if (dayForDate.type === 'workout') {
        if (dayForDate.status === WORKOUT_DAY_STATUS.COMPLETED) {
          currentStreak++;
        } else if (dayForDate.status === WORKOUT_DAY_STATUS.PENDING) {
          if (targetTime !== todayDate.getTime()) {
            foundBreak = true;
          }
        } else if (dayForDate.status === WORKOUT_DAY_STATUS.SKIPPED) {
          foundBreak = true;
        }
      } else if (dayForDate.type === 'rest') {
        currentStreak++;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    const totalMuscleHits = Array.from(muscleMap.values()).reduce((sum, count) => sum + count, 0);
    
    let title = "Monthly Workout Progress";
    let goalLabel = "Monthly Goal";
    let value = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;
    let valueLabel = `${value}%`;

    if (timeframe === TIMEFRAME.DAILY) {
      title = "Today's Workout Progress";
      goalLabel = "Daily Goal";
      value = todayWorkoutProgress;
      valueLabel = `${value}% Completed`;
    } else if (timeframe === TIMEFRAME.WEEKLY) {
      title = "Current Week Progress";
      goalLabel = "Weekly Goal";
      value = currentWeekProgress;
      valueLabel = `${value}%`;
    }

    const progressBar = {
      title,
      goalLabel,
      value,
      valueLabel
    };

  
    const totalPie = totalCompletedExercises + totalSkippedExercises;
    const pieChart = {
      labels: totalPie > 0 ? ['Completed', 'Skipped'] : ['No Data', ''],
      values: totalPie > 0 ? [totalCompletedExercises, totalSkippedExercises] : [1, 0]
    };

    const muscleDistribution = Array.from(muscleMap.entries()).map(([muscleName, count]) => ({
      muscleName, 
      count,
      percentage: totalMuscleHits > 0 ? Math.round((count / totalMuscleHits) * 100) : 0
    }));

    return {
      currentStreak,
      completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
      workoutsCompleted: totalCompleted,
      totalTrainingMinutes: Math.round(totalTrainingSeconds / 60),
      progressBar,
      pieChart,
      trendData,
      muscleDistribution,
      recentActivities: recentActivities.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).slice(0, 5)
    };
  }
}
