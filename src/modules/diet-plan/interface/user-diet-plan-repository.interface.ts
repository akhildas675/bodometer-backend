import { IUserDietPlan } from "../models/user.diet-plan.model";

export interface IUserDietPlanRepository {
  create(data: Partial<IUserDietPlan>): Promise<IUserDietPlan>;
  findByUserId(userId: string): Promise<IUserDietPlan[]>;
  findActiveByUserId(userId: string): Promise<IUserDietPlan | null>;
}
