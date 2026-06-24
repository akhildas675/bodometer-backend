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
import { Container } from "inversify";

export const mealCategoryRoute = (container: Container) => {
  const router = Router();
  const controller = container.get<MealCategoryController>(MEAL_CATEGORY_TYPES.MealCategoryController);

  router.post(
    "/admin/meal-category",
    validate(mealCategoryValidationSchema),
    ROLE_GUARD.ADMIN_GUARD,
    controller.createMealCategory,
  );

  router.get(
    "/admin/meal-category",
    validate(getAllMealCategoriesSchema),
    ROLE_GUARD.ADMIN_GUARD,
    controller.getAllMealCategories,
  );

  router.get(
    "/admin/meal-category/:id",
    validate(mealCategoryIdParamSchema),
    ROLE_GUARD.ADMIN_GUARD,
    controller.getMealCategoryById,
  );

  router.put(
    "/admin/meal-category/:id",
    validate(updateMealCategorySchema),
    ROLE_GUARD.ADMIN_GUARD,
    controller.updateMealCategory,
  );

  router.patch(
    "/admin/meal-category/:id/toggle-status",
    validate(mealCategoryIdParamSchema),
    ROLE_GUARD.ADMIN_GUARD,
    controller.toggleMealCategoryStatus,
  );

  return router;
};
