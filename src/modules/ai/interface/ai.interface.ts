import { PlanType } from "@/constants/fitness.constant";

export interface AvailableExercise {
  id: string;
  key: string;
  title: string;
  difficulty: string;
  isCompound: boolean;
  workoutEnvironments: string[];
}

export interface WorkoutGenerationPayload {
  planType: PlanType;
  answers: Record<string, unknown>;
  availableExercises: AvailableExercise[];
  previousPlansCount: number;
  completedWorkoutDaysTotal: number;
  past4WeeksData?: Record<string, unknown>[];
}