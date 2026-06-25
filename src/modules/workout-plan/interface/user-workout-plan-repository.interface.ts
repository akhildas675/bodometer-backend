import { IUserWorkoutPlanModel } from "../models/user.workout-plan.model";
import { CreateWeekInput } from "../interface/workout.interface";

export interface IUserWorkoutPlanRepository {

  createWeek(userId: string, week: CreateWeekInput): Promise<IUserWorkoutPlanModel>;
  findAllByUserId(userId: string): Promise<IUserWorkoutPlanModel[]>;
  findActiveWeekByUserId(userId: string): Promise<IUserWorkoutPlanModel | null>;
  expireActiveWeeks(userId: string): Promise<void>;
  saveWeek(weekDoc: IUserWorkoutPlanModel): Promise<IUserWorkoutPlanModel>;
}
