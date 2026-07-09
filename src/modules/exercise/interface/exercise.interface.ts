import { DifficultyLevel } from "@/constants/constant.values.ts/fitness.constant";

export interface ExerciseMedia {
  image: string;
  videoUrl?: string;
}

export interface Exercise {
  _id?: string;
  key: string;
  title: string;
  description: string;
  instructions: string[];
  media: ExerciseMedia;
  categoryIds: string[];
  targetMuscleIds: string[];
  equipmentIds?: string[];
  difficulty: DifficultyLevel;
  workoutEnvironments: string[];
  isCompound: boolean;
  isActive?: boolean;
  targetMuscles?: string[];
  equipment?: string[];
}
