import { WorkoutPlanStatus, PlanType } from "@/constants/constant.values.ts/fitness.constant";
import { IEmbeddedWorkoutDay } from "../models/user.workout-plan.model";

export interface CreateWeekInput {
    planType: PlanType;
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    status: WorkoutPlanStatus;
    workoutDays: IEmbeddedWorkoutDay[];
}
