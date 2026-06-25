import { IUserWorkoutPlanRepository } from "../interface/user-workout-plan-repository.interface";
import { CreateWeekInput } from "../interface/workout.interface";
import {
  UserWorkoutPlanModel,
  IUserWorkoutPlanModel,
} from "../models/user.workout-plan.model";
import mongoose from "mongoose";
import { WORKOUT_PLAN_STATUS, WORKOUT_DAY_STATUS } from "@/constants/fitness.constant";

export class UserWorkoutPlanRepository implements IUserWorkoutPlanRepository {

  async createWeek(userId: string, week: CreateWeekInput): Promise<IUserWorkoutPlanModel> {
    const doc = new UserWorkoutPlanModel({
      userId: new mongoose.Types.ObjectId(userId),
      ...week
    });
    return doc.save();
  }

  async findAllByUserId(userId: string): Promise<IUserWorkoutPlanModel[]> {
    return UserWorkoutPlanModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).sort({ weekNumber: 1 });
  }

  async findActiveWeekByUserId(userId: string): Promise<IUserWorkoutPlanModel | null> {
    return UserWorkoutPlanModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      status: WORKOUT_PLAN_STATUS.ACTIVE,
    });
  }

  async expireActiveWeeks(userId: string): Promise<void> {
    const activePlans = await UserWorkoutPlanModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: WORKOUT_PLAN_STATUS.ACTIVE
    });

    for (const plan of activePlans) {
      let hasCompletedDay = false;
      for (const day of plan.workoutDays) {
        if (day.status === WORKOUT_DAY_STATUS.COMPLETED) {
          hasCompletedDay = true;
          break;
        }
      }

      if (!hasCompletedDay) {
        await UserWorkoutPlanModel.deleteOne({ _id: plan._id });
      } else {
        plan.status = WORKOUT_PLAN_STATUS.EXPIRED;
        await plan.save();
      }
    }
  }

  async saveWeek(weekDoc: IUserWorkoutPlanModel): Promise<IUserWorkoutPlanModel> {
    weekDoc.markModified("workoutDays");
    return await weekDoc.save();
  }
}
