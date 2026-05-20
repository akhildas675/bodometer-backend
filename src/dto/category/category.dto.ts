import { PaginationMetaDto, PaginationQueryDto } from "../common.dto";

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
  isActive: boolean;
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

export interface CategoryDetailDto {
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
