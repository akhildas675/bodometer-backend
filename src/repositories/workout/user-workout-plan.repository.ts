import {
  IUserWorkoutPlanRepository,
  CreateWeekInput,
} from "@/interfaces/repository-interface/workout/user-workout-plan.repository.interface";
import {
  UserWorkoutPlanModel,
  IUserWorkoutPlanModel,
} from "@/models/user.workout-plan.model";
import mongoose from "mongoose";
import { WORKOUT_PLAN_STATUS } from "@/constants/fitness.constant";

export class UserWorkoutPlanRepository implements IUserWorkoutPlanRepository {


  async createWeek(userId: string, week: CreateWeekInput): Promise<IUserWorkoutPlanModel> {
    const doc = new UserWorkoutPlanModel({
      userId: new mongoose.Types.ObjectId(userId),
      weekNumber: week.weekNumber,
      startDate: week.startDate,
      endDate: week.endDate,
      status: week.status,
      workoutDays: week.workoutDays,
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
      status: WORKOUT_PLAN_STATUS.ACTIVE
    });
  }


  async expireActiveWeeks(userId: string): Promise<void> {
    await UserWorkoutPlanModel.updateMany(
      { 
        userId: new mongoose.Types.ObjectId(userId),
        status: WORKOUT_PLAN_STATUS.ACTIVE
      },
      {
        $set: { status: WORKOUT_PLAN_STATUS.EXPIRED },
      }
    );
  }


  async markDayCompleted(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    completed: boolean,
  ): Promise<IUserWorkoutPlanModel | null> {
    return UserWorkoutPlanModel.findOneAndUpdate(
      { 
        userId: new mongoose.Types.ObjectId(userId),
        weekNumber: weekNumber
      },
      {
        $set: {
          "workoutDays.$[d].status": completed ? "COMPLETED" : "PENDING",
          "workoutDays.$[d].completedAt": completed ? new Date() : null,
        },
      },
      {
        arrayFilters: [
          { "d.dayNumber": dayNumber },
        ],
        new: true,
      },
    );
  }

  /**
   * Update a single exercise's status/timing inside a specific week's day.
   */
  async markExerciseStatus(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    exerciseId: string,
    status: string,
    startedAt?: Date,
    timeTakenSeconds?: number,
  ): Promise<IUserWorkoutPlanModel | null> {
    const setFields: Record<string, unknown> = {
      "workoutDays.$[d].exercises.$[e].status": status,
    };

    if (startedAt !== undefined) {
      setFields["workoutDays.$[d].exercises.$[e].startedAt"] = startedAt;
    }
    if (timeTakenSeconds !== undefined) {
      setFields["workoutDays.$[d].exercises.$[e].timeTakenSeconds"] = timeTakenSeconds;
    }

    return UserWorkoutPlanModel.findOneAndUpdate(
      { 
        userId: new mongoose.Types.ObjectId(userId),
        weekNumber: weekNumber
      },
      { $set: setFields },
      {
        arrayFilters: [
          { "d.dayNumber": dayNumber },
          { "e.exerciseId": new mongoose.Types.ObjectId(exerciseId) },
        ],
        new: true,
      },
    );
  }
}
