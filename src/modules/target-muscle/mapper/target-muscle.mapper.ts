import { TargetMuscleDto } from "../dto/target-muscle.dto";
import { TargetMuscle } from '@/modules/target-muscle/interface/target.muscle.interface';

export class TargetMuscleMapper {
    static toTargetMuscleDto(targetMuscle: TargetMuscle): TargetMuscleDto {
        return {
            targetMuscleId: targetMuscle._id || "",
            title: targetMuscle.title,
            description: targetMuscle.description,
            image: targetMuscle.image,
            bodyRegion: targetMuscle.bodyRegion,
            isActive: targetMuscle.isActive ?? true,
        };
    }

    static toTargetMuscleDtoList(targetMuscles: TargetMuscle[]): TargetMuscleDto[] {
        return targetMuscles.map((tm) => TargetMuscleMapper.toTargetMuscleDto(tm));
    }
}