import { Router } from "express";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import { MEAL_CATEGORY_TYPES } from "../meal-category.types";
import { MealCategoryController } from "../controller/meal-category.controller";
import { 
  mealCategoryValidationSchema, 
  getAllMealCategoriesSchema, 
  mealCategoryIdParamSchema, 
  updateMealCategorySchema 
} from "../validation/meal-category.validation";
import container from "@/container/container";
import { MEAL_CATEGORY_PATHS } from "@/constants/routes.constant/meal-category.path";

const mealCategoryRoute = Router();
const controller = container.get<MealCategoryController>(MEAL_CATEGORY_TYPES.MealCategoryController);

mealCategoryRoute.post(
  MEAL_CATEGORY_PATHS.ROOT,
  ROLE_GUARD.ADMIN_GUARD,
  validate(mealCategoryValidationSchema),
  controller.createMealCategory,
);

mealCategoryRoute.get(
  MEAL_CATEGORY_PATHS.ROOT,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getAllMealCategoriesSchema),
  controller.getAllMealCategories,
);

mealCategoryRoute.get(
  MEAL_CATEGORY_PATHS.BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(mealCategoryIdParamSchema),
  controller.getMealCategoryById,
);

mealCategoryRoute.put(
  MEAL_CATEGORY_PATHS.BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(updateMealCategorySchema),
  controller.updateMealCategory,
);

mealCategoryRoute.patch(
  MEAL_CATEGORY_PATHS.STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(mealCategoryIdParamSchema),
  controller.toggleMealCategoryStatus,
);

export default mealCategoryRoute;
