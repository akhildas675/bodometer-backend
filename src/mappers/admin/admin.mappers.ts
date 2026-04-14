import type { Role } from "@/constants/roles";
import { UserInterface } from "@/interfaces/user/user.interface";
import { ITrainerWithProfile } from "@/interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";

import {
  ApproveTrainerResponseDto,
  GetTrainerAppointmentsResponseDto,
  GetTrainerByIdResponseDto,
  RejectTrainerResponseDto,
} from "@/dto/trainer/trainer.dto";
import { AdminGetUsersResponseDto, OnboardingSectionResponseDto, OnboardingQuestionResponseDto } from "@/dto/admin/admin.dto";
import { IUserDocument } from "@/models/user.model";
import { IOnboardingSection } from "@/models/onboarding-section.model";
import { IOnboardingQuestion } from "@/models/onboarding-question.model";

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

  static toSectionResponse(section: IOnboardingSection): OnboardingSectionResponseDto {
    return {
      id: section._id?.toString() || "",
      key: section.key,
      title: section.title,
      order: section.order,
      isActive: section.isActive,
    };
  }

  static toQuestionResponse(question: IOnboardingQuestion): OnboardingQuestionResponseDto {
    return {
      id: question._id?.toString() || "",
      key: question.key,
      schemaKey: question.schemaKey,
      isCoreLocked: question.isCoreLocked,
      question: question.question,
      section: question.section,
      order: question.order,
      isActive: question.isActive,
      type: question.type,
      options: question.options || [],
      followUp: question.followUp,
      config: question.config,
      validation: question.validation,
      createdAt: question.createdAt?.toISOString(),
      updatedAt: question.updatedAt?.toISOString(),
    };
  }
}

// --- TRAINERS ---
export class TrainerMapper {
  private static mapTrainerUser(user: IUserDocument) {
    return {
      _id: user._id?.toString() || "",
      name: user.name,
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber || null,
      profilePic: user.profilePic || null,
      gender: user.gender,
      role: user.role,
      isVerified: user.isVerified,
      dateOfBirth: user.dateOfBirth?.toISOString() || null,
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
    };
  }

  private static mapSpecializations(specializationIds: unknown) {
    const specs = (specializationIds || []) as any[];
    return specs.map((s) => ({
      _id: s._id?.toString() || "",
      workoutName: s.workoutName || "",
    }));
  }

  static toDto(trainer: ITrainerWithProfile): GetTrainerAppointmentsResponseDto {
    return {
      user: this.mapTrainerUser(trainer.user),
      profile: this.mapTrainerBaseProfile(trainer.profile),
    };
  }

  static toDtoArray(trainers: ITrainerWithProfile[]): GetTrainerAppointmentsResponseDto[] {
    return trainers.map((t) => TrainerMapper.toDto(t));
  }

  static toDetailDto(trainer: ITrainerWithProfile): GetTrainerByIdResponseDto {
    const baseProfile = this.mapTrainerBaseProfile(trainer.profile);
    
    return {
      user: this.mapTrainerUser(trainer.user),
      profile: {
        ...baseProfile,
        specializationIds: this.mapSpecializations(trainer.profile.specializationIds),
        applyCount: trainer.profile.applyCount ?? 0,
      },
    };
  }

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
