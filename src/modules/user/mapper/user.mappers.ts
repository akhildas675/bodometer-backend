import mongoose from "mongoose";
import { FindUserResponseDto, GetUsersResponseDto } from "../dto/user.dto";
import {
  TrainerDetailDto,
  TrainerListItemDto,
  RelatedTrainerDto,
} from "../../trainer/dto/trainer.dto";
import { ITrainerWithProfile } from '@/modules/trainer/interface/trainer.interface';
import { UserInterface } from '@/modules/user/interface/user.interface';

export class UserMapper {
  static toFindUserResponse(
    user: UserInterface,
    profile: {
      gender?: string | null;
      dateOfBirth?: Date | string | null;
    } | null,
  ): FindUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      userName: user.userName,
      phoneNumber: user.phoneNumber ?? "",
      gender: profile?.gender ?? null,
      profilePic: user.profilePic ?? null,
      dateOfBirth: profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString()
        : null,
    };
  }

  static toGetUsersResponse(user: UserInterface): GetUsersResponseDto {
      return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "user" | "trainer",
          isBlocked: user.isBlocked,
          isVerified: user.isVerified,
          createdAt: user.createdAt.toISOString(),
          profilePic: user.profilePic ?? null,
      };
  }

  static toGetUsersResponseList(users: UserInterface[]): GetUsersResponseDto[] {
      return users.map(user => this.toGetUsersResponse(user));
  }
}

export class UserMappers {
  static toListItemDto(trainer: ITrainerWithProfile): TrainerListItemDto {
    return {
      _id: trainer.user._id?.toString() || "",
      profileId: trainer.profile._id.toString(),
      name: trainer.user.name,
      profilePic: trainer.user.profilePic || null,
      experienceInYears: trainer.profile.experienceInYears,
      bio: trainer.profile.bio,
      coverPhoto: trainer.profile.coverPhoto,
      specializations: (
        (trainer.profile.specializations as unknown as {
          _id: string | mongoose.Types.ObjectId;
          name?: string;
        }[]) || []
      ).map((spec) => ({
        _id: String(spec._id),
        name: spec.name || "",
      })),
    };
  }

  static toListItemDtoArray(
    trainers: ITrainerWithProfile[],
  ): TrainerListItemDto[] {
    return trainers.map((t) => this.toListItemDto(t));
  }

  static toRelatedTrainerDto(data: ITrainerWithProfile): RelatedTrainerDto {
    return {
      _id: data.profile._id.toString(),
      name: data.user.name,
      profilePic: data.user.profilePic ?? null,
      experienceInYears: data.profile.experienceInYears,
      bio: data.profile.bio,
    };
  }

  static toTrainerDetailDto(
    data: ITrainerWithProfile,
    relatedTrainers: ITrainerWithProfile[] = []
  ): TrainerDetailDto {
    return {
      _id: data.profile._id.toString(),
      name: data.user.name,
      profilePic: data.user.profilePic ?? null,
      coverPhoto: data.profile.coverPhoto ?? "",
      bio: data.profile.bio,
      experienceInYears: data.profile.experienceInYears,
      specializations: (
        (data.profile.specializations as unknown as {
          _id: string | mongoose.Types.ObjectId;
          name?: string;
        }[]) || []
      ).map((spec) => ({
        _id: String(spec._id),
        name: spec.name || "",
      })),
      relatedTrainers: relatedTrainers.map((t) => this.toRelatedTrainerDto(t)),
    };
  }
}
