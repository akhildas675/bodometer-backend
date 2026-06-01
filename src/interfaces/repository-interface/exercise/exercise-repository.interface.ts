import { Exercise } from "../../domain.interface/exercise.interface";
import { PaginatedResult } from "../../domain.interface/common.interface";
import { ExerciseQueryDto } from "@/dto/exercise/exercise.dto";

export interface IExerciseRepository {
  createExercise(data: Exercise): Promise<Exercise>;
  getAllExercises(query: ExerciseQueryDto): Promise<PaginatedResult<Exercise>>;
  getExerciseById(exerciseId: string): Promise<Exercise | null>;
  updateExercise(exerciseId: string, data: Partial<Exercise>): Promise<Exercise | null>;
  toggleExerciseStatus(exerciseId: string): Promise<Exercise | null>;
  findExerciseByTitle(title: string): Promise<Exercise | null>;
  getExerciseByTitle(): Promise<{ title: string }[]>;
  findAll(filter?: Record<string, unknown>): Promise<Exercise[]>;
}
