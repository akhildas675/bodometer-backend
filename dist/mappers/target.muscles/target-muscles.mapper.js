"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetMuscleMapper = void 0;
class TargetMuscleMapper {
    static toTargetMuscleDto(targetMuscle) {
        return {
            targetMuscleId: targetMuscle._id || "",
            title: targetMuscle.title,
            description: targetMuscle.description,
            image: targetMuscle.image,
            bodyRegion: targetMuscle.bodyRegion,
            isActive: targetMuscle.isActive ?? true,
        };
    }
    static toTargetMuscleDtoList(targetMuscles) {
        return targetMuscles.map(this.toTargetMuscleDto);
    }
}
exports.TargetMuscleMapper = TargetMuscleMapper;
