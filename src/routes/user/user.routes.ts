import { Router } from "express";
import UserRepository from "../../repositories/user/user.repository";
import { UserService } from "../../services/user/user.services";
import { UserController } from "../../controllers/user/user.controller";
import { authGuard } from "../../middleware/authGuard";
import { S3Service } from "../../services/s3/s3.service";
import { imageUpload } from "../../config/multer";
import { USER_ROUTES } from "../../constants/routes.constant/user-routes.constant";

const userRoute = Router();
const userRepository = new UserRepository();
const s3Service = new S3Service();
const userService = new UserService(userRepository, s3Service);
const userController = new UserController(userService);

userRoute.get(
  USER_ROUTES.USER_PROFILE,
  ROLE_GUARD.USER_GUARD,
  userController.getUser,
);

userRoute.put(
  USER_ROUTES.PROFILE,
  ROLE_GUARD.USER_GUARD,
  userController.updateProfile,
);

userRoute.post(
  USER_ROUTES.PROFILE_PICTURE,
  imageUpload.single("file"),
  ROLE_GUARD.USER_GUARD,
  userController.uploadProfilePicture,
);

export default userRoute;