import { WorkoutGenerationPayload } from '@/modules/ai/interface/ai.interface';
import { WeekPlanResponse } from "@/services/ai-services/ai-workout.service";

export interface IAiWorkoutService {
    generateWorkoutPlan(payload: WorkoutGenerationPayload): Promise<WeekPlanResponse>;
}