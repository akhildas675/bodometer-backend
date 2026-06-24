import { inject, injectable } from "inversify";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";

import { 
  MealCategoryDto, 
  UpdateMealCategoryDto, 
  MealCategoryQueryDto, 
  GetAllMealCategoriesResponseDto, 
  ToggleMealCategoryStatusResponseDto 
} from "../dto/meal-category.dto";
import { MealCategory } from "../interface/meal-category.interface";
import { IMealCategoryRepository } from "../interface/meal-category-repository.interface";
import { IMealCategoryService } from "../interface/meal-category-service.interface";
import { MEAL_CATEGORY_TYPES } from "../meal-category.types";

@injectable()
export class MealCategoryService implements IMealCategoryService {
  constructor(
    @inject(MEAL_CATEGORY_TYPES.IMealCategoryRepository) private _mealCategoryRepository: IMealCategoryRepository,
  ) {}

  async createMealCategory(data: MealCategoryDto): Promise<void> {
    const mealCategoryPayload: MealCategory = data;
    await this._mealCategoryRepository.createMealCategory(mealCategoryPayload);
  }

  async getAllMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto> {
    const { data, pagination } = await this._mealCategoryRepository.getAllMealCategories({
      search: query.search,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
    return {
      data: data as MealCategoryDto[], 
      pagination,
    };
  }

  async getMealCategoryById(mealCategoryId: string): Promise<MealCategoryDto> {
    const category = await this._mealCategoryRepository.getMealCategoryById(mealCategoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.MEAL_CATEGORY.NOT_FOUND);
    }
    return category as MealCategoryDto;
  }

  async updateMealCategory(mealCategoryId: string, data: UpdateMealCategoryDto): Promise<void> {
    const category = await this._mealCategoryRepository.getMealCategoryById(mealCategoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.MEAL_CATEGORY.NOT_FOUND);
    }

    const updateData: Partial<MealCategory> = {
      title: data.title,
      description: data.description,
    };

    await this._mealCategoryRepository.updateMealCategory(mealCategoryId, updateData);
  }

  async toggleMealCategoryStatus(mealCategoryId: string): Promise<ToggleMealCategoryStatusResponseDto> {
    const category = await this._mealCategoryRepository.toggleMealCategoryStatus(mealCategoryId);
    if (!category) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.MEAL_CATEGORY.NOT_FOUND);
    }
    return {
      message: category.isActive ? "Meal category unblocked successfully" : "Meal category blocked successfully",
      mealCategoryId: mealCategoryId,
      isActive: category.isActive ?? true,
    };
  }
}
