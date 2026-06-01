import {
  IUserWorkoutPlanRepository,
  CreateWeekInput,
} from "@/interfaces/repository-interface/workout/user-workout-plan.repository.interface";
import {
  UserWorkoutPlanModel,
  IUserWorkoutPlanModel,
  IWeekPlan,
} from "@/models/user.workout-plan.model";
import mongoose from "mongoose";
import { WORKOUT_PLAN_STATUS } from "@/constants/fitness.constant";

export class UserWorkoutPlanRepository implements IUserWorkoutPlanRepository {

  /**
   * Push a new week into the user's single document.
   * Creates the document if it doesn't exist (upsert: true).
   */
  async upsertNewWeek(userId: string, week: CreateWeekInput): Promise<IUserWorkoutPlanModel> {
    const uid = new mongoose.Types.ObjectId(userId);

    const doc = await UserWorkoutPlanModel.findOneAndUpdate(
      { userId: uid },
      {
        $push: { weeks: week },
        $set: { currentWeek: week.weekNumber },
      },
      { upsert: true, new: true },
    );

    return doc!;
  }

  /**
   * Return the full user document (all weeks).
   */
  async findByUserId(userId: string): Promise<IUserWorkoutPlanModel | null> {
    return UserWorkoutPlanModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }

  /**
   * Find the ACTIVE week embedded inside the user's document.
   */
  async findActiveWeekByUserId(userId: string): Promise<IWeekPlan | null> {
    const doc = await UserWorkoutPlanModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!doc) return null;

    const activeWeek = doc.weeks.find(
      (w) => w.status === WORKOUT_PLAN_STATUS.ACTIVE,
    );

    return activeWeek ?? null;
  }

  /**
   * Set every ACTIVE week's status to EXPIRED for this user.
   */
  async expireActiveWeeks(userId: string): Promise<void> {
    await UserWorkoutPlanModel.updateOne(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: { "weeks.$[w].status": WORKOUT_PLAN_STATUS.EXPIRED },
      },
      {
        arrayFilters: [{ "w.status": WORKOUT_PLAN_STATUS.ACTIVE }],
      },
    );
  }

  /**
   * Mark a specific day inside a specific week as COMPLETED or PENDING.
   */
  async markDayCompleted(
    userId: string,
    weekNumber: number,
    dayNumber: number,
    completed: boolean,
  ): Promise<IUserWorkoutPlanModel | null> {
    return UserWorkoutPlanModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          "weeks.$[w].workoutDays.$[d].status": completed ? "COMPLETED" : "PENDING",
          "weeks.$[w].workoutDays.$[d].completedAt": completed ? new Date() : null,
        },
      },
      {
        arrayFilters: [
          { "w.weekNumber": weekNumber },
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
      "weeks.$[w].workoutDays.$[d].exercises.$[e].status": status,
    };

    if (startedAt !== undefined) {
      setFields["weeks.$[w].workoutDays.$[d].exercises.$[e].startedAt"] = startedAt;
    }
    if (timeTakenSeconds !== undefined) {
      setFields["weeks.$[w].workoutDays.$[d].exercises.$[e].timeTakenSeconds"] = timeTakenSeconds;
    }

    return UserWorkoutPlanModel.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: setFields },
      {
        arrayFilters: [
          { "w.weekNumber": weekNumber },
          { "d.dayNumber": dayNumber },
          { "e.exerciseId": new mongoose.Types.ObjectId(exerciseId) },
        ],
        new: true,
      },
    );
  }
}
