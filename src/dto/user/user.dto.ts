import { Gender } from "../../constants/identity.constants";
import { BaseUserProfileDto, PaginationQueryDto, PaginatedResponseDto } from "../common.dto";

export interface FindUserDto {
  userId: string;
}

export interface FindUserResponseDto extends BaseUserProfileDto {}

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

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}



export interface CreateCheckoutSessionDto {
  planId: string;
}

export interface CheckoutSessionResponseDto {
  sessionId: string;
  url: string;
}

export interface GetTrainersQueryDto extends PaginationQueryDto {
  specializationId?: string;
}

export interface TrainerListItemDto {
  _id: string;
  name: string;
  profilePic: string | null;
  profileId: string;
  experienceInYears: number;
  coverPhoto: string;
  bio: string;
  specializations: { _id: string; name: string }[];
}

export type TrainerListResponseDto = PaginatedResponseDto<TrainerListItemDto>;


export interface RelatedTrainerDto {
  _id: string;
  name: string;
  profilePic: string | null;
  experienceInYears: number;
  bio: string;
}


export interface TrainerDetailDto {
  _id: string;
  name: string;
  profilePic: string | null;
  coverPhoto: string;
  bio: string;
  experienceInYears: number;
  specializations: { _id: string; name: string }[];
}


export interface CategoryDetailDto{
  categoryId: string;
  name: string;
  description: string;
  media: {
    image: {
      url: string;
    };
  };
  isActive: boolean;
}


export interface UserSubscriptionPlanResponseDto{
   subscriptionPlanId?: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  features: {
    featureId: string;
    title?: string;
    limit?: number;
    limitType?: string;
  }[];
  isPopular: boolean;

  isActive?: boolean;
}

export interface ActiveSubscriptionDto {
  subscriptionId: string;
  planId: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: string;
  daysRemaining: number;
}
 