import { PaginationMeta } from "./common.interface";

export type OnboardingValue = string | number | boolean | string[] | number[];

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
