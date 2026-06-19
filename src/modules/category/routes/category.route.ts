import container from "@/container/container";
import { Router } from "express";
import { CategoryController } from "../controller/category.controller";
import { CATEGORY_TYPES } from "../category.types";
import { CATEGORY_PATHS } from "@/constants/routes.constant/category.paths";
import { ROLE_GUARD } from "@/constants/role.guard";
import { mediaUpload } from "@/config/multer";
import { validate } from "@/middleware/validate";
import { categoryIdParamSchema, categoryUpdateSchema, categoryValidationSchema } from "../validation/category.validation";

const categoryRoute = Router();

const categoryController = container.get<CategoryController>(CATEGORY_TYPES.Controller);


categoryRoute.post(
  CATEGORY_PATHS.ROOT,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(categoryValidationSchema),
  categoryController.createCategory,
);
categoryRoute.put(
  CATEGORY_PATHS.BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(categoryUpdateSchema),
  categoryController.updateCategory,
);

categoryRoute.get(
  CATEGORY_PATHS.BY_ID,
  ROLE_GUARD.ALL_GUARDS,
  categoryController.getCategoryById,
);


categoryRoute.get(
  CATEGORY_PATHS.ROOT,
  ROLE_GUARD.ALL_GUARDS,
  categoryController.getAllCategories,
);
categoryRoute.patch(
  CATEGORY_PATHS.TOGGLE_STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(categoryIdParamSchema),
  categoryController.toggleCategoryStatus,
);

export default categoryRoute