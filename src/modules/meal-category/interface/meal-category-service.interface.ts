import { 
  MealCategoryDto, 
  UpdateMealCategoryDto, 
  MealCategoryQueryDto, 
  GetAllMealCategoriesResponseDto, 
  ToggleMealCategoryStatusResponseDto 
} from "../dto/meal-category.dto";

export interface IMealCategoryService {
  createMealCategory(data: MealCategoryDto): Promise<void>;
  getAllMealCategories(query: MealCategoryQueryDto): Promise<GetAllMealCategoriesResponseDto>;
  getMealCategoryById(mealCategoryId: string): Promise<MealCategoryDto>;
  updateMealCategory(mealCategoryId: string, data: UpdateMealCategoryDto): Promise<void>;
  toggleMealCategoryStatus(mealCategoryId: string): Promise<ToggleMealCategoryStatusResponseDto>;
}
