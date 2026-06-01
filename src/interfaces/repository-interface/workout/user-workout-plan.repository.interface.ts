import { IUserWorkoutPlanModel, IEmbeddedWorkoutDay, IWeekPlan } from "@/models/user.workout-plan.model";
import { WorkoutPlanStatus } from "@/constants/fitness.constant";

// Input for pushing a new week into the user's document
export interface CreateWeekInput {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  status: WorkoutPlanStatus;
  workoutDays: IEmbeddedWorkoutDay[];
}

export interface IUserWorkoutPlanRepository {
  /**
   * Push a new week into the user's single document.
   * Creates the document if it doesn't exist yet (upsert).
   */
  upsertNewWeek(userId: string, week: CreateWeekInput): Promise<IUserWorkoutPlanModel>;

  /**
   * Return the single document for this user (contains all weeks).
   */
  findByUserId(userId: string): Promise<IUserWorkoutPlanModel | null>;

  /**
   * Return only the currently ACTIVE week embedded in the document, or null.
   */
  findActiveWeekByUserId(userId: string): Promise<IWeekPlan | null>;

  /**
   * Mark all ACTIVE weeks as EXPIRED for this user.
   */
  expireActiveWeeks(userId: string): Promise<void>;

  /**
   * Mark a day inside a specific week as completed/pending.
   */
  markDayCompleted(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    completed: boolean,
  ): Promise<IUserWorkoutPlanModel | null>;

  /**
   * Update the status of a single exercise inside a week's day.
   */
  markExerciseStatus(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    exerciseId: string,
    status: string,
    startedAt?: Date,
    timeTakenSeconds?: number,
  ): Promise<IUserWorkoutPlanModel | null>;
}
