import mongoose from "mongoose";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { WorkoutMapper } from "../../mappers/workout/workout-plan.mappers";
import { AiWorkoutService } from "../ai-services/ai-workout.service";
import { IUserWorkoutPlanRepository } from "@/interfaces/repository-interface/workout/user-workout-plan.repository.interface";
import { IAnswerRepository } from "../../interfaces/repository-interface/onboarding/answer-repository.interface";
import { IExerciseRepository } from "../../interfaces/repository-interface/exercise/exercise-repository.interface";
import { 
  WORKOUT_DAY_TYPE, 
  WORKOUT_DAY_STATUS, 
  WORKOUT_PLAN_STATUS, 
  WORKOUT_EXERCISE_STATUS, 
  TIMEFRAME, 
  Timeframe, 
} from "@/constants/fitness.constant";
import { IEmbeddedWorkoutDay, IEmbeddedWorkoutExercise } from "@/models/user.workout-plan.model";
import { 
  WorkoutPlanDetailDto, 
  WorkoutPlanResponseDto, 
  GetWorkoutPlansResponseDto, 
  WorkoutProgressResponseDto, 
  AiWorkoutExerciseDto, 
  RecentActivityDto, 
  MarkDayCompletedDto, 
  MarkExerciseStatusDto 
} from "../../dto/workout/workout-plan.dto";
import { IWorkoutPlanService } from "../../interfaces/service-interface/workout/workout-plan.service.interface";

export class WorkoutPlanService implements IWorkoutPlanService {
  constructor(
    private _userWorkoutPlanRepo: IUserWorkoutPlanRepository,
    private _exerciseRepo: IExerciseRepository,
    private _answerRepo: IAnswerRepository
  ) {}

  async generateWorkout(userId: string): Promise<WorkoutPlanDetailDto> {
    const onboardingAnswers = await this._answerRepo.getUserAnswers(userId);
    if (!onboardingAnswers || !onboardingAnswers.completed) {
      throw new AppError(STATUS.BAD_REQUEST, "Please complete onboarding before generating a workout plan.");
    }

    const { generationStatus } = await this.getWorkoutPlans(userId);

    if (!generationStatus.canGenerate) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.WORKOUT_PLAN.GENERATE_LOCKED);
    }

    const answersMap: Record<string, string | string[]> = {};
    for (const ans of onboardingAnswers.answers) {
      if (ans.questionKey) {
        answersMap[ans.questionKey] = ans.answer as string | string[];
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
    const previousPlansCount = userDocs.length;

    let completedWorkoutDaysTotal = 0;
    for (const week of userDocs) {
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

    const past4Weeks = userDocs.slice(-4).map(week => ({
      weekNumber: week.weekNumber,
      status: week.status,
      workoutDays: week.workoutDays.map(day => ({
        dayNumber: day.dayNumber,
        type: day.type,
        status: day.status,
        exercises: day.exercises.map(ex => {
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

    const aiWorkoutService = new AiWorkoutService();
    const aiResponse = await aiWorkoutService.generateWorkoutPlan({
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
      weekNumber,
      startDate,
      endDate,
      status: WORKOUT_PLAN_STATUS.ACTIVE,
      workoutDays: embeddedDays,
    });

    return WorkoutMapper.toWorkoutPlanDetailDto(updatedDoc, exerciseDataMap);
  }

  async getWorkoutPlans(userId: string): Promise<GetWorkoutPlansResponseDto> {
    let userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);

    if (userDocs && userDocs.length > 0) {
      const activeDoc = userDocs.find(doc => doc.status === WORKOUT_PLAN_STATUS.ACTIVE);
      const now = new Date();
      if (activeDoc && new Date(activeDoc.endDate) < now) {
        await this.generateWorkout(userId);
        userDocs = await this._userWorkoutPlanRepo.findAllByUserId(userId);
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
        }
      };
    }

    const sortedWeeks = [...userDocs].sort((a, b) => b.weekNumber - a.weekNumber);

    const exerciseIds = new Set<string>();
    sortedWeeks.forEach(week => {
      week.workoutDays.forEach(day => {
        day.exercises.forEach(ex => exerciseIds.add(ex.exerciseId.toString()));
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
    const INACTIVITY_DAYS = 4;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    let isInactive = false;

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
      const daysSinceLastWorkout = (Date.now() - mostRecentCompleted.getTime()) / MS_PER_DAY;
      if (daysSinceLastWorkout >= INACTIVITY_DAYS) {
        isInactive = true;
      }
    } else if (latestPlan?.startDate) {
      const daysSinceStart = (Date.now() - new Date(latestPlan.startDate).getTime()) / MS_PER_DAY;
      if (daysSinceStart >= INACTIVITY_DAYS) {
        isInactive = true;
      }
    }

    const allDaysFinished = latestPlan ? latestPlan.days.every(d => d.status === WORKOUT_DAY_STATUS.COMPLETED || d.status === WORKOUT_DAY_STATUS.SKIPPED) : true;
    const pendingDaysCount = latestPlan ? latestPlan.days.filter(d => d.status === WORKOUT_DAY_STATUS.PENDING).length : 0;
    const canGenerate = allDaysFinished || isInactive;

    let firstPendingDayNumber = -1;
    if (latestPlan) {
      const pendingDay = latestPlan.days.find(d => d.status === WORKOUT_DAY_STATUS.PENDING);
      firstPendingDayNumber = pendingDay ? pendingDay.dayNumber : -1;
    }

    return {
      plans,
      generationStatus: {
        canGenerate,
        isInactive,
        pendingDaysCount,
        hasCompletedWorkoutToday,
        firstPendingDayNumber
      }
    };
  }

  async markDayCompleted({ userId, dayNumber, completed }: MarkDayCompletedDto): Promise<WorkoutPlanResponseDto> {
    const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
    if (!activeWeek) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new AppError(STATUS.NOT_FOUND, "Workout day not found");
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

    const plansResponse = await this.getWorkoutPlans(userId);
    const updatedPlan = plansResponse.plans.find((p) => p.workoutPlanId === activeWeek._id.toString());
    if (!updatedPlan) throw new AppError(STATUS.INTERNAL_ERROR, "Failed to fetch updated plan");
    return updatedPlan;
  }

  async markExerciseStatus({ userId, dayNumber, instanceId, status }: MarkExerciseStatusDto): Promise<WorkoutPlanResponseDto> {
    const activeWeek = await this._userWorkoutPlanRepo.findActiveWeekByUserId(userId);
    if (!activeWeek) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.WORKOUT_PLAN.NOT_FOUND);
    }

    const day = activeWeek.workoutDays.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      throw new AppError(STATUS.NOT_FOUND, "Workout day not found");
    }

    const exercise = day.exercises.find((e) => e.instanceId === instanceId);
    if (!exercise) {
      throw new AppError(STATUS.NOT_FOUND, "Exercise not found");
    }

    if (status === WORKOUT_EXERCISE_STATUS.ACTIVE) {
      const isAnyActive = activeWeek.workoutDays.some((d) =>
        d.exercises.some((e) => e.status === WORKOUT_EXERCISE_STATUS.ACTIVE && e.instanceId !== instanceId)
      );

      if (isAnyActive) {
        throw new AppError(STATUS.BAD_REQUEST, "Another exercise is currently in progress. Please complete or pause it first.");
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

    const allExercisesFinished = day.exercises.length > 0 && day.exercises.every(e => e.status === WORKOUT_EXERCISE_STATUS.COMPLETED || e.status === WORKOUT_EXERCISE_STATUS.SKIPPED);

    day.status = allExercisesFinished ? WORKOUT_DAY_STATUS.COMPLETED : WORKOUT_DAY_STATUS.PENDING;
    day.completedAt = allExercisesFinished ? new Date() : undefined;

    await this._userWorkoutPlanRepo.saveWeek(activeWeek);

    const plansResponse = await this.getWorkoutPlans(userId);
    const updatedPlan = plansResponse.plans.find((p) => p.workoutPlanId === activeWeek._id.toString());
    if (!updatedPlan) throw new AppError(STATUS.INTERNAL_ERROR, "Failed to retrieve updated plan");
    return updatedPlan;
  }

  async getWorkoutProgress(userId: string, timeframe?: Timeframe): Promise<WorkoutProgressResponseDto> {
    const plansResponse = await this.getWorkoutPlans(userId);
    return this.calculateWorkoutProgress(plansResponse.plans, timeframe);
  }

  private calculateWorkoutProgress(plans: WorkoutPlanResponseDto[], timeframe?: Timeframe): WorkoutProgressResponseDto {
    if (!plans || plans.length === 0) {
      return {
        currentStreak: 0,
        completionRate: 0,
        workoutsCompleted: 0,
        totalTrainingMinutes: 0,
        currentWeekProgress: 0,
        todayWorkoutProgress: 0,
        plannedWorkouts: 0,
        completedWorkouts: 0,
        skippedWorkouts: 0,
        weeklyCompletionTrend: [],
        dailyCompletionTrend: [],
        monthlyCompletionTrend: [],
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

    // Weekly trend
    const weeklyCompletionTrend = plans.map(p => {
      const wDays = p.days.filter(d => d.type === 'workout');
      const wCompleted = wDays.filter(d => d.status === WORKOUT_DAY_STATUS.COMPLETED).length;
      return {
        weekNumber: p.weekNumber,
        completionRate: wDays.length > 0 ? (wCompleted / wDays.length) * 100 : 0
      };
    }).reverse().slice(-5);

    //daily trend
    const dailyCompletionTrend = [];
    if (activePlan) {
      for (const day of activePlan.days) {
        if (day.type === 'workout') {
          const rate = day.status === WORKOUT_DAY_STATUS.COMPLETED ? 100 : 0;
          dailyCompletionTrend.push({
            dayName: day.day,
            completionRate: rate
          });
        }
      }
    }

    // Monthly trend
    const monthlyMap = new Map<string, { planned: number, completed: number }>();
    for (const plan of plans) {
      if (plan.startDate) {
        const monthName = new Date(plan.startDate).toLocaleString('default', { month: 'short' });
        const entry = monthlyMap.get(monthName) || { planned: 0, completed: 0 };
        const wDays = plan.days.filter(d => d.type === 'workout');
        const wCompleted = wDays.filter(d => d.status === WORKOUT_DAY_STATUS.COMPLETED).length;
        entry.planned += wDays.length;
        entry.completed += wCompleted;
        monthlyMap.set(monthName, entry);
      }
    }

    const monthlyCompletionTrend = Array.from(monthlyMap.entries()).map(([monthName, data]) => ({
      monthName,
      completionRate: data.planned > 0 ? Math.round((data.completed / data.planned) * 100) : 0
    })).reverse().slice(-6);

    // timeframe
    let filteredPlans = plans;
    const now = new Date();

    if (timeframe === TIMEFRAME.DAILY) {
      filteredPlans = activePlan ? [activePlan] : [];
    } else if (timeframe === TIMEFRAME.WEEKLY) {
      const fiveWeeksAgo = new Date();
      fiveWeeksAgo.setDate(now.getDate() - 35);
      filteredPlans = plans.filter(p => new Date(p.startDate) >= fiveWeeksAgo);
    } else if (timeframe === TIMEFRAME.MONTHLY) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);
      filteredPlans = plans.filter(p => new Date(p.startDate) >= sixMonthsAgo);
    }

    //  filtered plans
    let totalPlannedExercises = 0;
    let totalCompletedExercises = 0;
    let totalSkippedExercises = 0;

    for (const plan of filteredPlans) {
      for (const day of plan.days) {
        if (day.type === 'workout') {
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
            totalPlannedExercises++;
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
      const wDays = activePlan.days.filter(d => d.type === 'workout');
      const wCompleted = wDays.filter(d => d.status === WORKOUT_DAY_STATUS.COMPLETED).length;
      currentWeekProgress = wDays.length > 0 ? Math.round((wCompleted / wDays.length) * 100) : 0;

      // workout
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let targetDay = activePlan.days.find(d => {
        if (!d.scheduledDate) return false;
        const dDate = new Date(d.scheduledDate);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === today.getTime();
      });

      if (!targetDay || targetDay.type !== 'workout') {
        targetDay = activePlan.days.find(d => d.type === 'workout' && d.status === WORKOUT_DAY_STATUS.PENDING);
      }

      if (targetDay && targetDay.exercises && targetDay.exercises.length > 0) {
        const completedEx = targetDay.exercises.filter(ex => ex.status === WORKOUT_EXERCISE_STATUS.COMPLETED).length;
        todayWorkoutProgress = Math.round((completedEx / targetDay.exercises.length) * 100);
      } else if (targetDay && targetDay.status === WORKOUT_DAY_STATUS.COMPLETED) {
        todayWorkoutProgress = 100;
      }
    }

    // Current Streak Calculation
    let currentStreak = 0;
    const allDays = plans.flatMap(p => p.days).filter(d => d.scheduledDate).sort((a, b) => new Date(b.scheduledDate!).getTime() - new Date(a.scheduledDate!).getTime());
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(todayDate);
    let foundBreak = false;

    while (!foundBreak) {
      const targetTime = currentDate.getTime();
      const dayForDate = allDays.find(d => {
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

    const muscleDistribution = Array.from(muscleMap.entries()).map(([muscleName, count]) => ({
      muscleName, count
    }));

    return {
      currentStreak,
      completionRate: totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0,
      workoutsCompleted: totalCompleted,
      totalTrainingMinutes: Math.round(totalTrainingSeconds / 60),
      currentWeekProgress,
      todayWorkoutProgress,
      plannedWorkouts: totalPlannedExercises,
      completedWorkouts: totalCompletedExercises,
      skippedWorkouts: totalSkippedExercises,
      weeklyCompletionTrend,
      dailyCompletionTrend,
      monthlyCompletionTrend,
      muscleDistribution,
      recentActivities: recentActivities.sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()).slice(0, 5)
    };
  }
}
