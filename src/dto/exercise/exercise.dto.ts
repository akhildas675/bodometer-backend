import { DifficultyLevel } from "../../constants/fitness.constant";
import { PaginationMetaDto, PaginationQueryDto } from "../common.dto";

export interface CreateExerciseDto {
  title: string;
  description: string;
  instructions: string[];
  categoryIds: string[];
  targetMuscleIds: string[];
  equipmentIds?: string[];
  difficulty: DifficultyLevel;
  workoutEnvironments: string[];
  isCompound?: boolean;
  video?: Express.Multer.File;
  image?: Express.Multer.File;
}


export interface UpdateExerciseDto {
  exerciseId?: string;
  title?: string;
  description?: string;
  instructions?: string[];
  categoryIds?: string[];
  targetMuscleIds?: string[];
  equipmentIds?: string[];
  difficulty?: DifficultyLevel;
  workoutEnvironments?: string[];
  isCompound?: boolean;
  video?: Express.Multer.File;
  image?: Express.Multer.File;

}

export interface ExerciseMediaDto {
  image: string;
  videoUrl?: string;
}

export interface ExerciseDto {
  exerciseId: string;
  key: string;
  title: string;
  description: string;
  instructions: string[];
  media: ExerciseMediaDto;
  categoryIds: string[];
  targetMuscleIds: string[];
  equipmentIds: string[];
  difficulty: DifficultyLevel;
  workoutEnvironments: string[];
  isCompound: boolean;
  isActive: boolean;
  targetMuscles?: string[];
  equipment?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GetAllExercisesResponseDto {
  data: ExerciseDto[];
  pagination: PaginationMetaDto;
}

export interface ToggleExerciseStatusResponseDto {
  message: string;
  exerciseId: string;
  isActive: boolean;
}

export interface ExerciseQueryDto extends PaginationQueryDto {
  search?: string;
  difficulty?: DifficultyLevel;
  targetMuscleId?: string;
  categoryId?: string;
  status?: string;
}
