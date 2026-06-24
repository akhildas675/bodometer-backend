import {
    CreateExerciseDto,
    ExerciseDto,
    ExerciseQueryDto,
    GetAllExercisesResponseDto,
    ToggleExerciseStatusResponseDto,
    UpdateExerciseDto,
} from "../dto/exercise.dto";

export interface IExerciseService {
    createExercise(data: CreateExerciseDto): Promise<void>;
    getAllExercises(query: ExerciseQueryDto): Promise<GetAllExercisesResponseDto>;
    getExerciseById(exerciseId: string): Promise<ExerciseDto>;
    updateExercise(exerciseId: string, data: UpdateExerciseDto): Promise<void>;
    toggleExerciseStatus(exerciseId: string): Promise<ToggleExerciseStatusResponseDto>;
}
