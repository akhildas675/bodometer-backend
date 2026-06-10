import { WorkoutPlanDetailDto, WorkoutPlanResponseDto, GetWorkoutPlansResponseDto, WorkoutProgressResponseDto, MarkDayCompletedDto, MarkExerciseStatusDto } from "../../../dto/workout/workout-plan.dto";
import { Timeframe } from "../../../constants/fitness.constant";

import { PlanType } from "@/constants/fitness.constant";

export interface IWorkoutPlanService {
  generateWorkout(userId: string, planType: PlanType): Promise<WorkoutPlanDetailDto>;
  getWorkoutPlans(userId: string, isPremium?: boolean, preventAutoGenerate?: boolean): Promise<GetWorkoutPlansResponseDto>;
  markDayCompleted(data: MarkDayCompletedDto): Promise<WorkoutPlanResponseDto>;
  markExerciseStatus(data: MarkExerciseStatusDto): Promise<WorkoutPlanResponseDto>;
  getWorkoutProgress(userId: string, timeframe?: Timeframe, isPremium?: boolean): Promise<WorkoutProgressResponseDto>;
}
