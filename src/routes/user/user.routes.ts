import { Router } from "express";
import UserRepository from "../../repositories/user/user.repository";
import { UserService } from "../../services/user/user.services";
import { UserController } from "../../controllers/user/user.controller";
import { authGuard } from "../../middleware/authGuard";
import { S3Service } from "../../services/s3/s3.service";
import { imageUpload } from "../../config/multer";

const userRoute = Router();

const userRepository = new UserRepository();
const s3Service = new S3Service();
const userService = new UserService(userRepository, s3Service);
const userController = new UserController(userService);

userRoute.get(
  "/user/user-profile",
  authGuard(["user"]),
  userController.getUser,
);
userRoute.put(
  "/user/profile",
  authGuard(["user"]),
  userController.updateProfile,
);
userRoute.post(
  "/user/profile-picture",
  imageUpload.single("file"),
  authGuard(["user"]),
  userController.uploadProfilePicture,
);

export default userRoute;
