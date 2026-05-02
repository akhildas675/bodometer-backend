import mongoose from "mongoose";
import { FindUserResponseDto, TrainerDetailDto, TrainerListItemDto } from "../../dto/user/user.dto";
import { ITrainerWithProfile } from "../../interfaces/domain.interface/trainer.interface/trainer.interface";
import { UserInterface } from "../../interfaces/domain.interface/user.interface/user.interface";


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
 



  static toListItemDto(trainer: ITrainerWithProfile): TrainerListItemDto {
    return {
      _id: trainer.user._id?.toString() || "",
       profileId: (trainer.profile._id as mongoose.Types.ObjectId).toString(),
      name: trainer.user.name,
      profilePic: trainer.user.profilePic || null,
      experienceInYears: trainer.profile.experienceInYears,
      bio: trainer.profile.bio,
      coverPhoto:trainer.profile.coverPhoto,

    };
  }

  static toListItemDtoArray(trainers: ITrainerWithProfile[]): TrainerListItemDto[] {
    return trainers.map((t) => this.toListItemDto(t));
  }

  static toTrainerDetailDto(data: ITrainerWithProfile): TrainerDetailDto {

      return {
    _id: (data.profile._id as mongoose.Types.ObjectId).toString(),
    name: data.user.name,
    profilePic: data.user.profilePic ?? null,
    coverPhoto: data.profile.coverPhoto ?? "",
    bio: data.profile.bio,
    experienceInYears: data.profile.experienceInYears,

  };
  }



  
}

