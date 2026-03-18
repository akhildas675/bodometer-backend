import { UserInterface } from "@/interfaces/user/user.interface";
import { FindUserResponseDto, UserWorkoutResponseDto, WorkoutDetailPageDto } from "@/dto/user/user.dto";
import { PaginationMeta, Workout } from "@/interfaces/admin/admin.interface";
import { ITrainerWithProfile } from "@/interfaces/trainer/trainer.interface";

export class UserMapper {
  static toFindUserResponse(user: UserInterface): FindUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber ?? "",
      gender: user.gender ?? null,
      profilePic: user.profilePic ?? null,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    };
  }
}


export class UserWorkoutMapper {
  static toDetailDto(
    workout: Workout,
    trainers: ITrainerWithProfile[],
    relatedWorkouts: Workout[],
  ): WorkoutDetailPageDto {
    return {
      workout: {
        id: workout.id,
        workoutName: workout.workoutName,
        workoutDescription: workout.workoutDescription,
        workoutImage: workout.workoutImage,
      },
      relatedTrainers: trainers.map((t) => ({
        _id: t.user._id?.toString() || "",
        name: t.user.name,
        profilePic: t.user.profilePic || null,
        experienceInYears: t.profile.experienceInYears,
        bio: t.profile.bio,
      })),
      relatedWorkouts: relatedWorkouts.map((w) => ({
        id: w.id,
        workoutName: w.workoutName,
        workoutDescription: w.workoutDescription,
        workoutImage: w.workoutImage,
      })),
    };
  }

  static toResponseDto(workout: Workout): UserWorkoutResponseDto {
    return {
      id: workout.id,
      workoutName: workout.workoutName,
      workoutDescription: workout.workoutDescription,
      workoutImage: workout.workoutImage,
    };
  }

  static toResponseDtoList(
    workouts: Workout[],
    pagination: PaginationMeta,
  ): { data: UserWorkoutResponseDto[]; pagination: PaginationMeta } {
    return {
      data: workouts.map((w) => this.toResponseDto(w)),
      pagination,
    };
  }
}