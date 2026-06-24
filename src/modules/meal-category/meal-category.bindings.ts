import { Container } from "inversify";
import { MEAL_CATEGORY_TYPES } from "./meal-category.types";
import { IMealCategoryRepository } from "./interface/meal-category-repository.interface";
import MealCategoryRepository from "./repositories/meal-category.repository";
import { IMealCategoryService } from "./interface/meal-category-service.interface";
import { MealCategoryService } from "./service/meal-category.services";
import { MealCategoryController } from "./controller/meal-category.controller";

export const loadMealCategoryBindings = (container: Container) => {
  container.bind<IMealCategoryRepository>(MEAL_CATEGORY_TYPES.IMealCategoryRepository).to(MealCategoryRepository);
  container.bind<IMealCategoryService>(MEAL_CATEGORY_TYPES.IMealCategoryService).to(MealCategoryService);
  container.bind<MealCategoryController>(MEAL_CATEGORY_TYPES.MealCategoryController).to(MealCategoryController);
};
