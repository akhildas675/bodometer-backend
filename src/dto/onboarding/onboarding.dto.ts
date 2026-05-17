import { OnboardingValue } from "../../interfaces/domain.interface/onboarding.interface";
import { PaginationMetaDto, PaginationQueryDto } from "../common.dto";

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
