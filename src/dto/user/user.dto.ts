import { Gender } from "../../constants/identity.constants";

export interface FindUserDto {
  userId: string;
}

export interface FindUserResponseDto {
  id: string;
  name: string;
  email: string;
  userName: string;
  phoneNumber: string | null;
  gender: Gender;
  profilePic?: string;
  dateOfBirth?: Date;
}

export interface UpdateUserProfileDto {
  name?: string;
  userName?: string;
  phoneNumber?: string | null;
  gender?: Gender;
  profilePic?: string;
  dateOfBirth?: Date;
}

export interface UpdateUserProfileResponseDto {
  message: string;
  data: FindUserResponseDto;
}

export interface UploadProfilePictureResponseDto {
  url: string;
  message: string;
}