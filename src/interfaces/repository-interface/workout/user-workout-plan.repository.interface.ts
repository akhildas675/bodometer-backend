import { IUserWorkoutPlanModel, IEmbeddedWorkoutDay } from "@/models/user.workout-plan.model";
import { WorkoutPlanStatus } from "@/constants/fitness.constant";

// Input for creating a new week document
export interface CreateWeekInput {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  status: WorkoutPlanStatus;
  workoutDays: IEmbeddedWorkoutDay[];
}

export interface IUserWorkoutPlanRepository {
  /**
   * Create a new week document for the user.
   */
  createWeek(userId: string, week: CreateWeekInput): Promise<IUserWorkoutPlanModel>;

  /**
   * Return all week documents for this user, sorted by weekNumber ascending.
   */
  findAllByUserId(userId: string): Promise<IUserWorkoutPlanModel[]>;

  /**
   * Return only the currently ACTIVE week document, or null.
   */
  findActiveWeekByUserId(userId: string): Promise<IUserWorkoutPlanModel | null>;

  /**
   * Set all ACTIVE week documents for a given user to EXPIRED.
   */
  expireActiveWeeks(userId: string): Promise<void>;

  /**
   * Persist changes made to an existing week document.
   */
  saveWeek(weekDoc: IUserWorkoutPlanModel): Promise<IUserWorkoutPlanModel>;
}
