import { WorkoutListDto } from "../../dto/trainer/trainer.dto";
import { TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";

export class TrainerMapper {
  static toTrainerWorkoutList(workoutList: TrainerWorkoutList): WorkoutListDto {
    return {
      id: workoutList.id,
      workoutList: workoutList.workoutName,
    };
  }

  static toTrainerWorkoutListResponse(
    workoutList: TrainerWorkoutList[],
  ): WorkoutListDto[] {
    return workoutList.map(this.toTrainerWorkoutList);
  }
}
