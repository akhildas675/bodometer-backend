import { Role } from "../../constants/roles";
import { AdminGetUsersResponseDto } from "../../dto/user/user.dto";
import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "../../dto/trainer/trainer.dto";
import { ITrainerWithProfile } from "../../interfaces/domain.interface/trainer.interface";
import { UserInterface } from "../../interfaces/domain.interface/user.interface";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";
import { IUserDocument } from "../../models/user.model";
import mongoose from "mongoose";

// Admin Account Mapper (User & Trainer list)
export class AdminAccountMapper {
  static toResponse(user: UserInterface): AdminGetUsersResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as Exclude<Role, "admin">,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      profilePic: user.profilePic || null,
    };
  }

  static toResponseList(users: UserInterface[]): AdminGetUsersResponseDto[] {
    return users.map((u) => AdminAccountMapper.toResponse(u));
  }
}

// --- TRAINERS ---
export class TrainerMapper {
  private static mapTrainerUser(
    user: IUserDocument,
    profile: ITrainerProfileDocument,
  ) {
    return {
      _id: user._id?.toString() || "",
      id: user._id?.toString() || "",
      name: user.name,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      profilePic: user.profilePic || null,
      gender: profile.gender,
      role: user.role,
      isVerified: user.isVerified,
      dateOfBirth: profile.dateOfBirth?.toISOString() || null,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt?.toISOString() || "",
      updatedAt: user.updatedAt?.toISOString() || "",
    };
  }

  private static mapTrainerBaseProfile(profile: ITrainerProfileDocument) {
    return {
      _id: profile._id?.toString() || "",
      userId: profile.userId.toString(),
      experienceInYears: profile.experienceInYears,
      certifications: profile.certifications ?? [],
      bio: profile.bio,
      coverPhoto: profile.coverPhoto,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason || null,
      createdAt: profile.createdAt?.toISOString() || "",
      updatedAt: profile.updatedAt?.toISOString() || "",
      specializations: (
        (profile.specializations as unknown as {
          _id: string | mongoose.Types.ObjectId;
          name?: string;
        }[]) || []
      ).map((spec) => ({
        _id: String(spec._id),
        name: spec.name || "",
      })),
    };
  }

  static toDto(
    trainer: ITrainerWithProfile,
  ): GetTrainerAppointmentsResponseDto {
    return {
      user: this.mapTrainerUser(trainer.user, trainer.profile),
      profile: this.mapTrainerBaseProfile(trainer.profile),
    };
  }

  static toDtoArray(
    trainers: ITrainerWithProfile[],
  ): GetTrainerAppointmentsResponseDto[] {
    return trainers.map((t) => TrainerMapper.toDto(t));
  }

  static toDetailDto(trainer: ITrainerWithProfile): GetTrainerByIdResponseDto {
    const baseProfile = this.mapTrainerBaseProfile(trainer.profile);

    return {
      user: this.mapTrainerUser(trainer.user, trainer.profile),
      profile: {
        ...baseProfile,

        applyCount: trainer.profile.applyCount ?? 0,
      },
    };
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
