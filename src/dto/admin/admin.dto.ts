import { FeatureType } from "@/constants/subscription.constant";
import { Role } from "../../constants/roles";
import { OnboardingValue } from "@/interfaces/domain.interface/admin.interface/admin.interface";
import { PaginationMetaDto, PaginationQueryDto } from "../common.dto";
export { PaginationMetaDto, PaginatedResponseDto, PaginationQueryDto } from "../common.dto";

export interface AdminBaseUserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "admin">;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
  profilePic?: string | null;
}





//trainer

export interface AdminGetTrainersDto extends PaginationQueryDto {
  isBlocked?: boolean;
}

export type AdminGetTrainersResponseDto = AdminBaseUserResponseDto

export interface AdminBlockUnblockTrainerDto {
  trainerId: string;
}
export interface ApproveTrainerResponseDto {
  profileId: string;
  status: string;
}

export interface RejectTrainerBodyDto {
  reason: string;
}

export interface GetTrainerAppointmentsQueryDto extends PaginationQueryDto {
  status?: string;
}


//user


export interface AdminGetUsersDto extends PaginationQueryDto {
  role?: Exclude<Role, "admin">;
  isBlocked?: boolean;
}

export type AdminGetUsersResponseDto = AdminBaseUserResponseDto

export interface AdminBlockUnBlockUserDto {
  userId: string;
}


export interface CreateCategoryDto {
  name: string;
  description: string;
  image?: Express.Multer.File;
}
export interface UpdateCategoryDto {
  categoryId: string;
  name?: string;
  description?: string;
  image?: Express.Multer.File;
}

export interface GetCategoryByIdResponseDto {
  categoryId: string;
  name: string;
  description: string;
  image: string;
}

export interface CategoryResponseDto {
  categoryId: string;
  name: string;
  description: string;
  image: string;
}

export interface CategoryQueryDto extends PaginationQueryDto {
  search?: string;
}

export interface GetAllCategoriesResponseDto {
  data: CategoryResponseDto[];
  pagination: PaginationMetaDto;
}

export interface ToggleCategoryStatusResponseDto {
  message: string;
  category: CategoryResponseDto;
}

export interface SubscriptionFeatureQueryDto extends PaginationQueryDto {
  search?: string;
}

export interface SubscriptionFeatureDto {
  subscriptionFeatureId: string;
  key: string;
  title: string;
  description: string;
  type: FeatureType
  isActive: boolean;
}

export interface GetAllSubscriptionFeaturesResponseDto {
  data: SubscriptionFeatureDto[];
  pagination: PaginationMetaDto;
}

export interface CreateSubscriptionFeatureDto {
  title: string;
  description: string;
  type: FeatureType

}

export interface UpdateSubscriptionFeatureDto {
  subscriptionFeatureId: string;
  title?: string;
  description?: string;
  type?: FeatureType
}

export interface ToggleSubscriptionFeatureStatusResponseDto {
  message: string;
  feature: SubscriptionFeatureDto;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isPopular?: boolean;
  features: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface SubscriptionPlanQueryDto extends PaginationQueryDto {
  search?: string;
}

export interface SubscriptionPlanDto {
  subscriptionPlanId: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isPopular: boolean;
  isActive: boolean;
  features: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface GetAllSubscriptionPlansResponseDto {
  data: SubscriptionPlanDto[];
  pagination: PaginationMetaDto;
}

export interface ToggleSubscriptionPlanStatusResponseDto {
  message: string;
  plan: SubscriptionPlanDto;
}

export interface GetSubscriptionPlanByIdResponseDto {
  subscriptionPlanId: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  isPopular: boolean;
  isActive: boolean;
  features: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface UpdateSubscriptionPlanDto {
  subscriptionPlanId: string;
  name?: string;
  description?: string;
  price?: number;
  durationInDays?: number;
  isPopular?: boolean;
  isActive?: boolean;
  features?: Array<{ featureId: string; limit?: number; limitType?: string }>;
}

export interface QuestionGroupResponseDto {
  groupId: string;
  key: string;
  title: string;
  order: number;
  isActive: boolean;
}

export interface CreateQuestionGroupDto {
  key: string;
  title: string;
  order: number;
}

export interface UpdateQuestionGroupDto {
  title: string;
  order: number;
}

export interface GetAllQuestionGroupsResponseDto {
  data: QuestionGroupResponseDto[];
  pagination: PaginationMetaDto;
}

export interface OnboardingQuestionResponseDto {
  questionId: string;
  key: string;
  question: string;
  description?: string;
  groupId: string;
  order: number;
  isActive: boolean;
  type: string;
  options?: { label: string; value: OnboardingValue }[];
  dataSource?: string;
  next?: {
    condition: { operator: string; value?: OnboardingValue };
    nextQuestionId: string;
  }[];
  numberConfig?: { min?: number; max?: number; step?: number; unit?: string };
  validation?: { required?: boolean };
  createdAt?: string;
}

export interface QuestionQueryDto extends PaginationQueryDto {
  groupId?: string;
  search?: string;
}

export interface CreateQuestionDto {
  key: string;
  question: string;
  description?: string;
  groupId: string;
  order: number;
  type: string;
  options?: { label: string; value: OnboardingValue }[];
  dataSource?: string;
  next?: {
    condition: { operator: string; value?: OnboardingValue };
    nextQuestionId: string;
  }[];
  numberConfig?: { min?: number; max?: number; step?: number; unit?: string };
  validation?: { required?: boolean };
}

export interface UpdateQuestionDto {
  question?: string;
  description?: string;
  groupId?: string;
  order?: number;
  type?: string;
  options?: { label: string; value: OnboardingValue }[];
  dataSource?: string;
  next?: {
    condition: { operator: string; value?: OnboardingValue };
    nextQuestionId: string;
  }[];
  numberConfig?: { min?: number; max?: number; step?: number; unit?: string };
  validation?: { required?: boolean };
}

export interface GetAllQuestionsResponseDto {
  data: OnboardingQuestionResponseDto[];
  pagination: PaginationMetaDto;
}