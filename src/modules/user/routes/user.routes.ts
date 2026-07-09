import { Router } from "express";

import container from "@/container/container";
import { UserController } from "../controller/user.controller";
import { USER_TYPES } from "../user.types";

import { USER_PATHS } from "@/constants/routes.constant/user.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { validate } from "@/middleware/validate";
import { mediaUpload } from "@/config/multer";

import {
  changePasswordSchema,
  updateUserProfileSchema,
  uploadProfilePictureSchema,
  getUsersSchema,
  userIdParamSchema,
  bmiCalculationSchema,
} from "@/modules/user/validation/user.validator";

const userRoute = Router();

const userController = container.get<UserController>(USER_TYPES.UserController);

userRoute.get(
  USER_PATHS.PROFILE,
  ROLE_GUARD.USER_GUARD,
  userController.getUser,
);

userRoute.post(
  USER_PATHS.CALCULATE_BMI,
  validate(bmiCalculationSchema),
  userController.calculateBmiPublic,
);

userRoute.put(
  USER_PATHS.PROFILE,
  ROLE_GUARD.USER_GUARD,
  validate(updateUserProfileSchema),
  userController.updateProfile,
);

userRoute.post(
  USER_PATHS.PROFILE_PICTURE,
  ROLE_GUARD.USER_GUARD,
  mediaUpload.single("file"),
  validate(uploadProfilePictureSchema),
  userController.uploadProfilePicture,
);

userRoute.patch(
  USER_PATHS.CHANGE_PASSWORD,
  ROLE_GUARD.USER_GUARD,
  validate(changePasswordSchema),
  userController.changePassword,
);

userRoute.get(
  USER_PATHS.USERS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getUsersSchema),
  userController.getUsers,
);

userRoute.patch(
  USER_PATHS.TOGGLE_USER_STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(userIdParamSchema),
  userController.toggleStatusUser,
);

export default userRoute;
