import { TrainerProfileResponseDto, WorkoutListDto } from "../../dto/trainer/trainer.dto";
import { TrainerProfileInterface, TrainerWorkoutList } from "../../interfaces/trainer/trainer.interface";

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


    static toProfileResponse(profile: TrainerProfileInterface): TrainerProfileResponseDto {
    return {
      id: profile.id.toString(),
      name: profile.name,
      email: profile.email,
      userName: profile.userName,
      phoneNumber: profile.phoneNumber,
      gender: profile.gender,
      profilePic: profile.profilePic,
      dateOfBirth: profile.dateOfBirth,
    };
  }

  static toProfileResponseList(
    profiles: TrainerProfileInterface[],
  ): TrainerProfileResponseDto[] {
    return profiles.map((profile) => this.toProfileResponse(profile));
  }



}
