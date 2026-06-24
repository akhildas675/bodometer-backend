import { TargetMuscleQueryDto } from "../dto/target-muscle.dto";
import { PaginatedResult } from "@/interfaces/domain.interface/common.interface";
import { TargetMuscle } from "@/interfaces/domain.interface/target.muscle";

export interface ITargetMuscleRepository {
    createTargetMuscle(targetMuscleData: TargetMuscle): Promise<TargetMuscle>;
    getAllTargetMuscles(query: TargetMuscleQueryDto): Promise<PaginatedResult<TargetMuscle>>;
    getTargetMuscleById(targetMuscleId: string): Promise<TargetMuscle | null>;
    updateTargetMuscle(targetMuscleId: string, data: Partial<TargetMuscle>): Promise<TargetMuscle | null>;
    toggleTargetMuscleStatus(targetMuscleId: string): Promise<TargetMuscle | null>;
    findTargetMuscleByTitle(title: string): Promise<TargetMuscle | null>;
}