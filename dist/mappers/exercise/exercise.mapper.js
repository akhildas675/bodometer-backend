"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseMapper = void 0;
class ExerciseMapper {
    static toExerciseDto(exercise) {
        return {
            exerciseId: exercise._id || "",
            key: exercise.key,
            title: exercise.title,
            description: exercise.description,
            instructions: exercise.instructions,
            media: {
                image: exercise.media.image,
                videoUrl: exercise.media.videoUrl,
            },
            categoryIds: exercise.categoryIds,
            targetMuscleIds: exercise.targetMuscleIds,
            equipmentIds: exercise.equipmentIds?.map(id => id.toString()) || [],
            difficulty: exercise.difficulty,
            workoutEnvironments: exercise.workoutEnvironments,
            isCompound: exercise.isCompound,
            isActive: exercise.isActive ?? true,
            targetMuscles: exercise.targetMuscles,
            equipment: exercise.equipment,
        };
    }
    static toExerciseDtoList(exercises) {
        return exercises.map((e) => this.toExerciseDto(e));
    }
}
exports.ExerciseMapper = ExerciseMapper;
