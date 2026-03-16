import { Router } from "express";
import { UserService } from "@/services/user/user.services";
import { UserController } from "@/controllers/user/user.controller";
import { S3Service } from "@/services/s3/s3.service";
import { imageUpload } from "@/config/multer";
import { USER_ROUTES } from "@/constants/routes.constant/user-routes.constant";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import { updateUserProfileSchema, uploadProfilePictureSchema } from "@/validators/user/user.validator";
import { createUserModule } from "@/modules/user/user.module";

const userRoute = Router();
const {userController}=createUserModule()
userRoute.get(
  USER_ROUTES.USER_PROFILE,
  ROLE_GUARD.USER_GUARD,
  userController.getUser,
);

userRoute.put(
  USER_ROUTES.PROFILE,
  ROLE_GUARD.USER_GUARD,
  validate(updateUserProfileSchema),
  userController.updateProfile,
);
userRoute.post(
  USER_ROUTES.PROFILE_PICTURE,
  imageUpload.single("file"),
  ROLE_GUARD.USER_GUARD,
  validate(uploadProfilePictureSchema),
  userController.uploadProfilePicture,
);

export default userRoute;