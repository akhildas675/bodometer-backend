import type { Role } from "@/constants/roles";
import { UserInterface } from "@/interfaces/user/user.interface";
import { ITrainerWithProfile } from "@/interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";
import { Workout } from "@/interfaces/admin/admin.interface";


import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "@/dto/trainer/trainer.dto";
import { AdminGetUsersResponseDto, WorkoutResponseDto,  } from "@/dto/admin/admin.dto";

// Account Mapper (User & Trainer list)
export class AdminAccountMapper {
  static toResponse(user: UserInterface): AdminGetUsersResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role  as Exclude<Role, "admin">,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }

  static toResponseList(users: UserInterface[]): AdminGetUsersResponseDto[] {
    return users.map((u) => AdminAccountMapper.toResponse(u));
  }
}

//Trainer Mapper 
export class TrainerMapper {

  static toDto(trainer: ITrainerWithProfile): GetTrainerAppointmentsResponseDto {
    return {
      user: {
        _id: trainer.user._id?.toString() || "",
        name: trainer.user.name,
        userName: trainer.user.userName,
        email: trainer.user.email,
        phoneNumber: trainer.user.phoneNumber || null,
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
        certifications: trainer.profile.certifications ?? [],
        bio: trainer.profile.bio,
        coverPhoto:trainer.profile.coverPhoto,
        verificationStatus: trainer.profile.verificationStatus,
        rejectionReason: trainer.profile.rejectionReason || null,
        createdAt: trainer.profile.createdAt?.toISOString() || "",
        updatedAt: trainer.profile.updatedAt?.toISOString() || "",
      },
    };
  }

  static toDtoArray(trainers: ITrainerWithProfile[]): GetTrainerAppointmentsResponseDto[] {
    return trainers.map((t) => TrainerMapper.toDto(t));
  }

  // Detail view
  static toDetailDto(trainer: ITrainerWithProfile): GetTrainerByIdResponseDto {
    return {
      user: {
        _id: trainer.user._id?.toString() || "",
        name: trainer.user.name,
        userName: trainer.user.userName,
        email: trainer.user.email,
        phoneNumber: trainer.user.phoneNumber || null,
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
        specializationIds: (
          trainer.profile.specializationIds as unknown as {
            _id: { toString(): string };
            workoutName: string;
          }[]
        ).map((s) => ({
          _id: s._id.toString(),
          workoutName: s.workoutName,
        })),
        experienceInYears: trainer.profile.experienceInYears,
        certifications: trainer.profile.certifications ?? [],
        bio: trainer.profile.bio,
        coverPhoto:trainer.profile.coverPhoto,
        verificationStatus: trainer.profile.verificationStatus,
        rejectionReason: trainer.profile.rejectionReason || null,
        applyCount: trainer.profile.applyCount ?? 0,
        createdAt: trainer.profile.createdAt?.toISOString() || "",
        updatedAt: trainer.profile.updatedAt?.toISOString() || "",
      },
    };
  }

  // Approve / Reject
  static toApproveDto(profile: ITrainerProfileDocument): ApproveTrainerResponseDto {
    return {
      message: "Trainer approved successfully",
      profile: {
        _id: profile._id?.toString() || "",
        verificationStatus: profile.verificationStatus,
      },
    };
  }

  static toRejectDto(profile: ITrainerProfileDocument): RejectTrainerResponseDto {
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

// //  Workout Mapper
// export class WorkoutMapper {
//   static toAdminResponse(workout: Workout): WorkoutResponseDto {
//     return {
//         id: workout.id!,
//       workoutName: workout.workoutName,
//       workoutDescription: workout.workoutDescription,
//       workoutImage: workout.workoutImage,
//       coverPhoto:workout.coverPhoto,
//       introVideo:workout.introVideo,
//       targetMuscles:workout.targetMuscles,
//       benefits:workout.benefits,
//       equipment:workout.equipment,
//       isActive: workout.isActive,
//       createdAt: workout.createdAt?.toISOString() ?? "",
//     };
//   }

//   static toAdminResponseList(workouts: Workout[]): WorkoutResponseDto[] {
//     return workouts.map((w) => WorkoutMapper.toAdminResponse(w));
//   }
// }