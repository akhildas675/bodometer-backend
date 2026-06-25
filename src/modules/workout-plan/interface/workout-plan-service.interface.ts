import { WorkoutPlanDetailDto, WorkoutPlanResponseDto, GetWorkoutPlansResponseDto, WorkoutProgressResponseDto, MarkDayCompletedDto, MarkExerciseStatusDto } from "../dto/workout-plan.dto";
import { Timeframe } from "../../../constants/fitness.constant";

import { PlanType } from "@/constants/fitness.constant";

export interface IWorkoutPlanService {
  generateWorkout(userId: string): Promise<WorkoutPlanDetailDto>;
  getWorkoutPlans(userId: string, preventAutoGenerate?: boolean): Promise<GetWorkoutPlansResponseDto>;
  markDayCompleted(data: MarkDayCompletedDto): Promise<WorkoutPlanResponseDto>;
  markExerciseStatus(data: MarkExerciseStatusDto): Promise<WorkoutPlanResponseDto>;
  getWorkoutProgress(userId: string, timeframe?: Timeframe): Promise<WorkoutProgressResponseDto>;
}
