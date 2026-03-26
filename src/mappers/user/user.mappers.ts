import { UserInterface } from "@/interfaces/user/user.interface";
import { FindUserResponseDto, TrainerDetailDto, TrainerListItemDto, UserWorkoutResponseDto, WorkoutDetailPageDto } from "@/dto/user/user.dto";
import { PaginationMeta, Workout } from "@/interfaces/admin/admin.interface";
import { ITrainerWithProfile } from "@/interfaces/trainer/trainer.interface";
import mongoose from "mongoose";

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


export class UserMappers {
  static toDetailDto(
    workout: Workout,
    trainers: ITrainerWithProfile[],
    relatedWorkouts: Workout[],
  ): WorkoutDetailPageDto {
    return {
      workout: {
        id: workout.id!,
        workoutName: workout.workoutName,
        workoutDescription: workout.workoutDescription,
        workoutImage: workout.workoutImage,
        coverPhoto: workout.coverPhoto,
        introVideo: workout.introVideo,
        targetMuscles: workout.targetMuscles,
        benefits: workout.benefits,
        equipment: workout.equipment,
        isActive: workout.isActive,
        createdAt: workout.createdAt?.toISOString() ?? "",
      },
      relatedTrainers: trainers.map((t) => ({
        _id: t.user._id?.toString() || "",
        name: t.user.name,
        profilePic: t.user.profilePic || null,
        experienceInYears: t.profile.experienceInYears,
        bio: t.profile.bio,
      })),
      relatedWorkouts: relatedWorkouts.map((w) => ({
        id: w.id!,
        workoutName: w.workoutName,
        workoutDescription: w.workoutDescription,
        workoutImage: w.workoutImage || "",
        coverPhoto: w.coverPhoto || "",
        introVideo: w.introVideo || "",
        targetMuscles: w.targetMuscles ?? [],
        equipment: w.equipment ?? [],
        benefits: w.benefits ?? [],
        isActive: w.isActive,
        createdAt: w.createdAt?.toISOString() ?? "",
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


  static toListItemDto(trainer: ITrainerWithProfile): TrainerListItemDto {
    return {
      _id: trainer.user._id?.toString() || "",
       profileId: (trainer.profile._id as mongoose.Types.ObjectId).toString(),
      name: trainer.user.name,
      profilePic: trainer.user.profilePic || null,
      experienceInYears: trainer.profile.experienceInYears,
      bio: trainer.profile.bio,
      coverPhoto:trainer.profile.coverPhoto,
      specializations: (trainer.profile.specializationIds as unknown as {
        _id: { toString(): string };
        workoutName: string;
      }[]).map((s) => ({
        _id: s._id.toString(),
        workoutName: s.workoutName,
      })),
    };
  }

  static toListItemDtoArray(trainers: ITrainerWithProfile[]): TrainerListItemDto[] {
    return trainers.map((t) => this.toListItemDto(t));
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
  static toTrainerDetailDto(data: ITrainerWithProfile): TrainerDetailDto {
    const specializations = (
      data.profile.specializationIds as unknown as { _id: mongoose.Types.ObjectId; workoutName: string }[]
    ).map((s) => ({
      _id: s._id.toString(),
      workoutName: s.workoutName,
    }));

      return {
    _id: (data.profile._id as mongoose.Types.ObjectId).toString(),
    name: data.user.name,
    profilePic: data.user.profilePic ?? null,
    coverPhoto: data.profile.coverPhoto ?? "",
    bio: data.profile.bio,
    experienceInYears: data.profile.experienceInYears,
    specializations,
  };
  }
}

