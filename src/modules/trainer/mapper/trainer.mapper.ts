import { UserInterface } from '@/modules/user/interface/user.interface';

import { FindTrainerResponseDto, GetTrainerAppointmentsResponseDto, GetTrainerByIdResponseDto, ApproveTrainerResponseDto, RejectTrainerResponseDto, GetAllTrainersResponseDto } from "@/modules/trainer/dto/trainer.dto";
import { ITrainerWithProfile } from '@/modules/trainer/interface/trainer.interface';
import { ITrainerProfileDocument } from "@/modules/trainer/model/trainer-profile.model";

export class TrainerMapper {
  static toProfileResponse(
    user: UserInterface,
    profile?: {
      gender?: string | null;
      dateOfBirth?: Date | string | null;
      experienceInYears?: number;
      coverPhoto?: string;
      certifications?: string[];
      bio?: string;
      specializations?: string[];
    } | null,
  ): FindTrainerResponseDto {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber ?? "",
      gender: profile?.gender ?? null,
      profilePic: user.profilePic ?? null,
      dateOfBirth: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString()
        : null,
      experienceInYears: profile?.experienceInYears ?? 0,
      coverPhoto: profile?.coverPhoto ?? "",
      certifications: profile?.certifications ?? [],
      bio: profile?.bio ?? "",
      specializations: profile?.specializations ?? [],
    };
  }

  static toProfileResponseList(
    users: UserInterface[],
  ): FindTrainerResponseDto[] {
    return users.map((user) => this.toProfileResponse(user));
  }

  static toGetAllTrainersResponse(user: UserInterface): GetAllTrainersResponseDto {
    return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as "user" | "trainer",
        isBlocked: user.isBlocked,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        profilePic: user.profilePic ?? null,
    };
  }

  static toGetAllTrainersResponseList(users: UserInterface[]): GetAllTrainersResponseDto[] {
      return users.map((user) => this.toGetAllTrainersResponse(user));
  }

  static toDtoArray(data: ITrainerWithProfile[]): GetTrainerAppointmentsResponseDto[] {
      return data.map(item => ({
          user: {
              id: (item.user as unknown as Record<string, unknown>).id?.toString() || item.user._id?.toString() || "",
              _id: item.user._id?.toString() || "",
              name: item.user.name,
              email: item.user.email,
              userName: item.user.userName,
              phoneNumber: item.user.phoneNumber ?? null,
              gender: null,
              profilePic: item.user.profilePic ?? null,
              dateOfBirth: null,
              role: item.user.role,
              isVerified: item.user.isVerified,
              isBlocked: item.user.isBlocked,
              createdAt: item.user.createdAt?.toISOString() || "",
          },
          profile: {
              _id: item.profile._id?.toString() || "",
              userId: item.profile.userId?.toString() || "",
              experienceInYears: item.profile.experienceInYears,
              certifications: item.profile.certifications || [],
              bio: item.profile.bio,
              coverPhoto: item.profile.coverPhoto,
              verificationStatus: item.profile.verificationStatus,
              rejectionReason: item.profile.rejectionReason ?? null,
              createdAt: item.profile.createdAt?.toISOString() || "",
              updatedAt: item.profile.updatedAt?.toISOString() || "",
              specializations: (item.profile.specializations as unknown as Record<string, unknown>[] || []).map(s => ({
                  _id: (s._id as { toString(): string } | undefined)?.toString() || (typeof s === "string" ? s : ""),
                  name: (s.name as string | undefined) || "Unknown",
              }))
          }
      }));
  }

  static toDetailDto(data: ITrainerWithProfile): GetTrainerByIdResponseDto {
      return {
          user: {
              id: (data.user as unknown as Record<string, unknown>).id?.toString() || data.user._id?.toString() || "",
              _id: data.user._id?.toString() || "",
              name: data.user.name,
              email: data.user.email,
              userName: data.user.userName,
              phoneNumber: data.user.phoneNumber ?? null,
              gender: null,
              profilePic: data.user.profilePic ?? null,
              dateOfBirth: null,
              role: data.user.role,
              isVerified: data.user.isVerified,
              isBlocked: data.user.isBlocked,
              createdAt: data.user.createdAt?.toISOString() || "",
          },
          profile: {
              _id: data.profile._id?.toString() || "",
              userId: data.profile.userId?.toString() || "",
              experienceInYears: data.profile.experienceInYears,
              coverPhoto: data.profile.coverPhoto,
              certifications: data.profile.certifications || [],
              bio: data.profile.bio,
              verificationStatus: data.profile.verificationStatus,
              rejectionReason: data.profile.rejectionReason ?? null,
              applyCount: data.profile.applyCount,
              createdAt: data.profile.createdAt?.toISOString() || "",
              updatedAt: data.profile.updatedAt?.toISOString() || "",
              specializations: (data.profile.specializations as unknown as Record<string, unknown>[] || []).map(s => ({
                  _id: (s._id as { toString(): string } | undefined)?.toString() || (typeof s === "string" ? s : ""),
                  name: (s.name as string | undefined) || "Unknown",
              }))
          }
      };
  }

  static toApproveTrainerResponse(
    profile: ITrainerProfileDocument
  ): ApproveTrainerResponseDto {
      return {
          message: "Trainer approved successfully.",
          profile: {
              _id: profile._id?.toString() || "",
              verificationStatus: profile.verificationStatus,
          }
      };
  }

  static toRejectTrainerResponse(
    profile: ITrainerProfileDocument
  ): RejectTrainerResponseDto {
      return {
          message: "Trainer rejected successfully.",
          profile: {
              _id: profile._id?.toString() || "",
              verificationStatus: profile.verificationStatus,
              rejectionReason: profile.rejectionReason || "",
          }
      };
  }
}
