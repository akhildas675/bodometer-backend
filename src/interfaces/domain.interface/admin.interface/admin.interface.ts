import { FeatureType } from "@/constants/subscription.constant";
import { Role, ROLES } from "../../../constants/roles";
import { PaginationMeta } from "../common.interface";
export { PaginationMeta, PaginatedResult } from "../common.interface";

export type OnboardingValue = string | number | boolean | string[] | number[];

export interface AdminAccountInterface<R extends Role> {
  id: string;
  name: string;
  email: string;
  role: R;
  isBlocked: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type AdminUserInterface = AdminAccountInterface<typeof ROLES.USER>;
export type AdminTrainerInterface = AdminAccountInterface<typeof ROLES.TRAINER>;

export interface AdminUserActionDto {
  userId: string;
}


export interface Category {
  categoryId?: string;
  name: string;
  description: string;
  media: {
    image: {
      url: string;
    };
  };
  isActive?: boolean;
}

export interface CategoryQuery {
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}

export interface GetAllCategoriesResponse {
  data: Category[];
  pagination: PaginationMeta;
}

export interface SubscriptionFeature {
  subscriptionFeatureId?: string;
  key: string;
  title: string;
  description: string;
  type: FeatureType;
  isActive?: boolean;
}

export interface SubscriptionFeatureQuery {
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}


export interface SubscriptionPlan {
  subscriptionPlanId?: string;
  name: string;
  description: string;
  price: number;
  durationInDays: number;
  features: {
    featureId: string;
    limit?: number;
    limitType?: string;
  }[];
  isPopular: boolean;

  isActive?: boolean;
}

export interface SubscriptionPlanQuery {
  search?: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetAllSubscriptionPlansResponse {
  data: SubscriptionPlan[];
  pagination: PaginationMeta;
}


export interface QuestionGroup {
  groupId?: string;
  key: string;
  title: string;
  order: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface QuestionGroupQuery {
  search?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
}

export interface GetAllQuestionGroupsResponse {
  data: QuestionGroup[];
  pagination: PaginationMeta;
}


export interface OnboardingQuestion {
  questionId?: string;
  key: string;
  question: string;
  description?: string;
  groupId: string;
  order: number;
  isActive?: boolean;
  type: string;
  options?: { label: string; value: OnboardingValue }[];
  dataSource?: string;
  next?: {
    condition: { operator: string; value?: OnboardingValue };
    nextQuestionId: string;
  }[];
  numberConfig?: { min?: number; max?: number; step?: number; unit?: string };
  validation?: { required?: boolean };
  createdBy?: string;
  createdAt?: string;
}

export interface QuestionQuery {
  search?: string;
  groupId?: string;
  limit?: number;
  page?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetAllQuestionsResponse {
  data: OnboardingQuestion[];
  pagination: PaginationMeta;
}

export interface UserAnswerSubmission {
  userId: string;
  answers: {
    questionId: string;
    questionKey?: string;
    answer: OnboardingValue;
  }[];
  completed?: boolean;
  completedAt?: string;
}
