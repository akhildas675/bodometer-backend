import { Workout } from "@/interfaces/admin/admin.interface";
import { IWorkoutDocument } from "@/models/workout.model";
import { TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";
import { WorkoutResponseDto } from "@/dto/admin/admin.dto";


export class WorkoutMapper {
  static toInterface(doc: IWorkoutDocument): Workout {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      coverPhoto:doc.coverPhoto,
      introVideo:doc.introVideo,
      targetMuscles:doc.targetMuscles,
      benefits:doc.benefits,
      equipment:doc.equipment,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
    };
  }

  static toWorkoutList(workout: Workout): TrainerWorkoutList {
    return {
      id: workout.id!,             
      workoutName: workout.workoutName,
    };
  }

  static toWorkoutListArray(workouts: Workout[]): TrainerWorkoutList[] {
    return workouts.map((w) => this.toWorkoutList(w));
  }

  static toAdminResponse(workout: Workout): WorkoutResponseDto {
    return {
      id: workout.id!,
      workoutName: workout.workoutName,
      workoutDescription: workout.workoutDescription,
      workoutImage: workout.workoutImage,
      coverPhoto:workout.coverPhoto,
      introVideo:workout.introVideo,
      targetMuscles:workout.targetMuscles,
      benefits:workout.benefits,
      equipment:workout.equipment,
      isActive: workout.isActive,
      createdAt: workout.createdAt?.toISOString() ?? "",
    };
  }

  static toAdminResponseList(workouts: Workout[]): WorkoutResponseDto[] {
    return workouts.map((w) => this.toAdminResponse(w));
  }
}

