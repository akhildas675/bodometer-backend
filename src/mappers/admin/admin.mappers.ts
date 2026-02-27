import type { Role } from "@/constants/roles";
import {
  AdminAccountInterface,
  Workout,
} from "@/interfaces/admin/admin.interface";
import { ITrainerWithProfile } from "@/interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";
import { AdminGetUsersResponseDto } from "@/dto/admin/admin-user.dto";
import { ApproveTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, RejectTrainerResponseDto } from "@/dto/trainer/trainer.dto";
import { GetWorkoutsResponseDto } from "@/dto/admin/admin.dto";

export class AdminAccountMapper {
  static toResponse<T extends Exclude<Role, "admin">>(
    account: AdminAccountInterface<T>,
  ): AdminGetUsersResponseDto {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      isBlocked: account.isBlocked,
      isVerified: account.isVerified,
      createdAt: account.createdAt,
    };
  }

  static toResponseList<T extends Exclude<Role, "admin">>(
    accounts: AdminAccountInterface<T>[],
  ): AdminGetUsersResponseDto[] {
    return accounts.map((account) => AdminAccountMapper.toResponse(account));
  }
}

export class WorkoutMapper {
  static toResponse(workout: Workout): GetWorkoutsResponseDto {
    return {
      id: workout.id!,
      workoutName: workout.workoutName,
      workoutDescription: workout.workoutDescription,
      workoutImage: workout.workoutImage,
      isActive: workout.isActive,
    };
  }

  static toResponseList(workouts: Workout[]): GetWorkoutsResponseDto[] {
    return workouts.map(this.toResponse);
  }
}
export class TrainerMapper {
  static toDto(
    trainer: ITrainerWithProfile,
  ): GetTrainerAppointmentsResponseDto {
    return {
      user: {
        _id: trainer.user._id?.toString() || "",
        name: trainer.user.name,
        userName: trainer.user.userName,
        email: trainer.user.email,
        phoneNumber: trainer.user.phoneNumber,
        profilePic: trainer.user.profilePic || null,
        gender: trainer.user.gender,
        role: trainer.user.role,
        isVerified: trainer.user.isVerified,
        dateOfBirth: trainer.user.dateOfBirth?.toISOString() || null,
        isBlocked: trainer.user.isBlocked,
        createdAt: trainer.user.createdAt?.toISOString() || "",
        updatedAt: trainer.user.updatedAt?.toISOString() || "",
      },
      profile: {
        _id: trainer.profile._id?.toString() || "",
        userId: trainer.profile.userId.toString(),
        experienceInYears: trainer.profile.experienceInYears,
        certifications: trainer.profile.certifications,
        bio: trainer.profile.bio,
        verificationStatus: trainer.profile.verificationStatus,
        rejectionReason: trainer.profile.rejectionReason || null,
        createdAt: trainer.profile.createdAt?.toISOString() || "",
        updatedAt: trainer.profile.updatedAt?.toISOString() || "",
      },
    };
  }

  static toDtoArray(
    trainers: ITrainerWithProfile[],
  ): GetTrainerAppointmentsResponseDto[] {
    return trainers.map((trainer) => this.toDto(trainer));
  }

  static toDetailDto(trainer: ITrainerWithProfile): GetTrainerByIdResponseDto {
    return this.toDto(trainer);
  }

  static toApproveDto(
    profile: ITrainerProfileDocument,
  ): ApproveTrainerResponseDto {
    return {
      message: "Trainer approved successfully",
      profile: {
        _id: profile._id?.toString() || "",
        verificationStatus: profile.verificationStatus,
      },
    };
  }

  static toRejectDto(
    profile: ITrainerProfileDocument,
  ): RejectTrainerResponseDto {
    return {
      message: "Trainer rejected successfully",
      profile: {
        _id: profile._id?.toString() || "",
        verificationStatus: profile.verificationStatus,
        rejectionReason: profile.rejectionReason || "",
      },
    };
  }
}
