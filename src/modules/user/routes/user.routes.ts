import { Router } from "express";
import container from "@/container/container";
import { USER_TYPES } from "../user.types";
import { UserController } from "../controller/user.controller";

import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import {
  changePasswordSchema,
  updateUserProfileSchema,
  uploadProfilePictureSchema,
  getUsersSchema,
  userIdParamSchema,

} from "@/validators/user/user.validator";
import { mediaUpload } from "@/config/multer";
import { USER_PATHS } from "@/constants/routes.constant/user.paths";

const userRoute = Router();
const userController = container.get<UserController>(USER_TYPES.UserController);

// --- User Routes ---
userRoute.route(USER_PATHS.PROFILE)
  .get(ROLE_GUARD.USER_GUARD, userController.getUser.bind(userController))
  .put(ROLE_GUARD.USER_GUARD, validate(updateUserProfileSchema), userController.updateProfile.bind(userController));

userRoute.route(USER_PATHS.PROFILE_PICTURE)
  .post(mediaUpload.single("file"), ROLE_GUARD.USER_GUARD, validate(uploadProfilePictureSchema), userController.uploadProfilePicture.bind(userController));

userRoute.route(USER_PATHS.CHANGE_PASSWORD)
  .patch(validate(changePasswordSchema), ROLE_GUARD.USER_GUARD, userController.changePassword.bind(userController));

// Uncomment if BMI calculation is added back to user service
// userRoute.route(USER_PATHS.BMI)
//   .post(validate(bmiCalculationSchema), userController.calculateBmiPublic.bind(userController));

// --- Admin Routes ---
userRoute.route(USER_PATHS.USERS)
  .get(ROLE_GUARD.ADMIN_GUARD, validate(getUsersSchema), userController.getUsers.bind(userController));

userRoute.route(USER_PATHS.USER_BLOCK)
  .patch(ROLE_GUARD.ADMIN_GUARD, validate(userIdParamSchema), userController.blockUser.bind(userController));

userRoute.route(USER_PATHS.USER_UNBLOCK)
  .patch(ROLE_GUARD.ADMIN_GUARD, validate(userIdParamSchema), userController.unblockUser.bind(userController));

export default userRoute;
