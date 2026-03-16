import { Workout } from "@/interfaces/admin/admin.interface";
import { IWorkoutDocument } from "@/models/workout.model";
import { TrainerWorkoutList } from "@/interfaces/trainer/trainer.interface";
import { GetWorkoutsResponseDto } from "@/dto/admin/admin.dto";

export class WorkoutMapper {
  static toInterface(doc: IWorkoutDocument): Workout {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      isActive: doc.isActive,
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

  static toAdminResponse(workout: Workout): GetWorkoutsResponseDto {
    return {
      id: workout.id!,
      workoutName: workout.workoutName,
      workoutDescription: workout.workoutDescription,
      workoutImage: workout.workoutImage,
      isActive: workout.isActive,
    };
  }

  static toAdminResponseList(workouts: Workout[]): GetWorkoutsResponseDto[] {
    return workouts.map((w) => this.toAdminResponse(w));
  }
}