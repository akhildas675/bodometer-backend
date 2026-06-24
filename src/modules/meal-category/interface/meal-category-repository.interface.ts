import { MealCategory } from "./meal-category.interface";
import { MealCategoryQueryDto } from "../dto/meal-category.dto";
import { PaginatedResult } from "@/interfaces/domain.interface/common.interface";

export interface IMealCategoryRepository {
    createMealCategory(data: MealCategory): Promise<void>;
    getAllMealCategories(query: MealCategoryQueryDto): Promise<PaginatedResult<MealCategory>>;
    getMealCategoryById(id: string): Promise<MealCategory | null>;
    updateMealCategory(id: string, data: Partial<MealCategory>): Promise<MealCategory | null>;
    toggleMealCategoryStatus(id: string): Promise<MealCategory | null>;
}