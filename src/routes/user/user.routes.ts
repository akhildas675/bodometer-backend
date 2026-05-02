import { Router } from "express";
import { createUserModule } from "../../modules/user/user.module";
import { USER_ROUTES } from "../../constants/routes.constant/user-routes.constant";
import { ROLE_GUARD } from "../../constants/role.guard";
import { validate } from "../../middleware/validate";
import { updateUserProfileSchema, uploadProfilePictureSchema } from "../../validators/user/user.validator";
import { mediaUpload } from "../../config/multer";


const userRoute = Router();
const { userController } = createUserModule();
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
  mediaUpload.single("file"),
  ROLE_GUARD.USER_GUARD,
  validate(uploadProfilePictureSchema),
  userController.uploadProfilePicture,
);


userRoute.post(USER_ROUTES.STRIPE_WEBHOOK, userController.stripeWebhook);

userRoute.get(
  USER_ROUTES.GET_TRAINERS,
  ROLE_GUARD.USER_GUARD,
  userController.getTrainers,
);

userRoute.get(
  USER_ROUTES.GET_TRAINERS_BY_ID,
  ROLE_GUARD.USER_GUARD,
  userController.getTrainerById,
);

userRoute.patch(
  USER_ROUTES.CHANGE_PASSWORD,
  ROLE_GUARD.USER_GUARD,
  userController.changePassword,
);



export default userRoute;
