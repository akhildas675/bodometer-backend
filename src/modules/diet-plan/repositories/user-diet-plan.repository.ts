import { injectable } from "inversify";
import { UserDietPlanModel, IUserDietPlan } from "../models/user.diet-plan.model";
import { IUserDietPlanRepository } from "../interface/user-diet-plan-repository.interface";

@injectable()
export class UserDietPlanRepository implements IUserDietPlanRepository {
  async create(data: Partial<IUserDietPlan>): Promise<IUserDietPlan> {
    return await UserDietPlanModel.create(data);
  }

  async findByUserId(userId: string): Promise<IUserDietPlan[]> {
    return await UserDietPlanModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findActiveByUserId(userId: string): Promise<IUserDietPlan | null> {
    return await UserDietPlanModel.findOne({ userId, status: "active" }).sort({ createdAt: -1 });
  }
}
