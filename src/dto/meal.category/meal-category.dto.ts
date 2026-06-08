import { PaginatedResponseDto, PaginationQueryDto } from "../common.dto";

export interface MealCategoryDto {
  mealCategoryId?: string;
  title: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateMealCategoryDto {
  mealCategoryId: string;
  title: string;
  description: string;
  isActive?: boolean;
}

export interface MealCategoryQueryDto extends PaginationQueryDto {
  status?: string;
}

export type GetAllMealCategoriesResponseDto = PaginatedResponseDto<MealCategoryDto>;


export interface ToggleMealCategoryStatusResponseDto {
  message: string;
  mealCategoryId: string;
  isActive: boolean;
}