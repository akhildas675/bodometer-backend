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
  validate(mealCategoryValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  controller.createMealCategory,
);

mealCategoryRoute.get(
  MEAL_CATEGORY_PATHS.ROOT,
  validate(getAllMealCategoriesSchema),
  ROLE_GUARD.ADMIN_GUARD,
  controller.getAllMealCategories,
);

mealCategoryRoute.get(
  MEAL_CATEGORY_PATHS.BY_ID,
  validate(mealCategoryIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  controller.getMealCategoryById,
);

mealCategoryRoute.put(
  MEAL_CATEGORY_PATHS.BY_ID,
  validate(updateMealCategorySchema),
  ROLE_GUARD.ADMIN_GUARD,
  controller.updateMealCategory,
);

mealCategoryRoute.patch(
  MEAL_CATEGORY_PATHS.STATUS,
  validate(mealCategoryIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  controller.toggleMealCategoryStatus,
);

export default mealCategoryRoute;
