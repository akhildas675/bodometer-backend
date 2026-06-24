import {
  CreateTargetMuscleDto,
  GetAllTargetMusclesResponseDto,
  TargetMuscleDto,
  TargetMuscleQueryDto,
  ToggleTargetMuscleStatusResponseDto,
  UpdateTargetMuscleDto,
} from "../dto/target-muscle.dto";

export interface ITargetMuscleService {
  createTargetMuscle(data: CreateTargetMuscleDto): Promise<void>;
  getAllTargetMuscles(query: TargetMuscleQueryDto): Promise<GetAllTargetMusclesResponseDto>;
  getTargetMuscleById(targetMuscleId: string): Promise<TargetMuscleDto>;
  updateTargetMuscle(targetMuscleId: string, data: UpdateTargetMuscleDto): Promise<void>;
  toggleTargetMuscleStatus(targetMuscleId: string): Promise<ToggleTargetMuscleStatusResponseDto>;
}
