import { MESSAGES } from "@/constants/messages";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import {
  Category,
  CategoryQuery,
} from "@/modules/category/interface/category.interface";
import { ICategoryRepository } from "@/modules/category/interface/category-repository.interface";
import { ICategoryService } from "@/modules/category/interface/category-interface.service";
import { IS3Service } from '@/modules/s3/interface/s3-service.interface';
import { CategoryMapper } from "@/modules/category/mapper/category.mapper";
import { AppError } from "@/utils/appError";
import {
  CategoryDetailDto,
  CategoryQueryDto,
  CreateCategoryDto,
  GetAllCategoriesResponseDto,
  ToggleCategoryStatusResponseDto,
  UpdateCategoryDto,
} from "../dto/category.dto";
import { inject, injectable } from "inversify";
import { CATEGORY_TYPES } from "../category.types";
import { Role, ROLES } from "@/constants/constant.values.ts/roles";

import { get, set, delPattern } from "@/config/redis";

const CATEGORY_CACHE_TTL = 3600; // 1 hour
const CATEGORY_CACHE_KEYS = {
  ALL: "categories:all",
  BY_ID: (id: string) => `categories:byId:${id}`,
};

@injectable()

export class CategoryService implements ICategoryService {
  constructor(
    @inject(CATEGORY_TYPES.Repository)
    private _categoryRepository: ICategoryRepository,
    @inject(CATEGORY_TYPES.S3Service)
    private _s3Service: IS3Service,
  ) {}

  async createCategory(data: CreateCategoryDto): Promise<void> {
    if (!data.image) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.ADMIN.CATEGORY_IMAGE_UPLOAD_FAILED,
      );
    }

    const imageUrl = await this._s3Service.uploadFile(data.image, data.name);

    const categoryData: Category = {
      name: data.name,
      description: data.description,
      media: { image: { url: imageUrl } },
      isActive: true,
    };

    await this._categoryRepository.createCategory(categoryData);
    
    // Invalidate all category caches
    await delPattern("categories:*");
  }



  async getCategoryById(id: string): Promise<CategoryDetailDto> {
    const cacheKey = CATEGORY_CACHE_KEYS.BY_ID(id);
    const cached = await get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CategoryDetailDto;
    }

    const category = await this._categoryRepository.getCategoryById(id);

    if (!category)
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.ADMIN.CATEGORY_NOT_FOUND);

    const result = CategoryMapper.toCategoryDetailDto(category);
    await set(cacheKey, JSON.stringify(result), CATEGORY_CACHE_TTL);
    return result;
  }

  async updateCategory(data: UpdateCategoryDto): Promise<void> {
    if (!data.categoryId) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.CATEGORY.CATEGORY_ID_REQUIRED,
      );
    }

    if (!data.name) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.CATEGORY.CATEGORY_ID_NAME,
      );
    }

    if (!data.description) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.CATEGORY.CATEGORY_ID_DESCRIPTION,
      );
    }

    const category = await this._categoryRepository.getCategoryById(
      data.categoryId,
    );

    if (!category) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.CATEGORY.CATEGORY_FETCH_FAILED,
      );
    }

    let imageUrl = category.media.image.url;
    if (data.image) {
      imageUrl = await this._s3Service.uploadFile(data.image, data.name);
    }
    const categoryData: Category = {
      name: data.name,
      description: data.description,
      media: { image: { url: imageUrl } },
    };

    await this._categoryRepository.updateCategory(
      data.categoryId,
      categoryData,
    );
    
    // Invalidate all category caches
    await delPattern("categories:*");
  }

  async getAllCategories(
    query: CategoryQueryDto,role:Role
  ): Promise<GetAllCategoriesResponseDto> {

     const repositoryQuery: CategoryQuery = {
    ...query,
  };

  if (role !== ROLES.ADMIN) {
    repositoryQuery.isActive = true;
  }

    // Check cache first (only for non-admin users)
    const cacheKey = role !== ROLES.ADMIN ? CATEGORY_CACHE_KEYS.ALL : null;
    if (cacheKey) {
      const cached = await get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as GetAllCategoriesResponseDto;
      }
    }

    const { data, pagination } =
      await this._categoryRepository.getAllCategories(repositoryQuery);

    const result = { data: CategoryMapper.toCategoryResponseDtoList(data), pagination };

    // Cache the result for non-admin users
    if (cacheKey) {
      await set(cacheKey, JSON.stringify(result), CATEGORY_CACHE_TTL);
    }

    return result;
  }

  async toggleCategoryStatus(
    categoryId: string,
  ): Promise<ToggleCategoryStatusResponseDto> {
    const category = await this._categoryRepository.getCategoryById(categoryId);

    if (!category) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.CATEGORY.CATEGORY_NOT_FOUND,
      );
    }

    const updated =
      await this._categoryRepository.toggleCategoryStatus(categoryId);

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.CATEGORY.CATEGORY_UPDATE_FAILED,
      );
    }
    
    // Invalidate all category caches
    await delPattern("categories:*");
    
    return CategoryMapper.toCategoryResponseDto(updated);
  }
}
