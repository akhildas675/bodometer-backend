import { WorkoutPlanStatus } from "@/constants/fitness.constant";
import { IEmbeddedWorkoutDay } from "@/models/user.workout-plan.model";

export interface CreateWeekInput {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    status: WorkoutPlanStatus;
    workoutDays: IEmbeddedWorkoutDay[];
}
