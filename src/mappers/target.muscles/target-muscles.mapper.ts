import { TargetMuscleDto } from "@/dto/target.muscles/target-muscles.dto";
import { TargetMuscle } from "@/interfaces/domain.interface/target.muscle";

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
        return targetMuscles.map(this.toTargetMuscleDto);
    }
}