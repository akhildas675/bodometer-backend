import { Router } from "express";
import { USER_ROUTES } from "@/constants/routes.constant/user-routes.constant";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import {
  updateUserProfileSchema,
  uploadProfilePictureSchema,
} from "@/validators/user/user.validator";
import { createUserModule } from "@/modules/user/user.module";
import { mediaUpload } from "@/config/multer";

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
userRoute.get(
  USER_ROUTES.GET_WORKOUTS,
  ROLE_GUARD.USER_GUARD,
  userController.getWorkouts,
);
userRoute.get(
  USER_ROUTES.GET_WORKOUT_DETAIL,
  ROLE_GUARD.USER_GUARD,
  userController.getWorkoutDetail,
);

userRoute.get(
  USER_ROUTES.GET_SUBSCRIPTIONS,
  ROLE_GUARD.USER_GUARD,
  userController.getSubscriptions,
);
userRoute.get(
  USER_ROUTES.GET_MY_SUBSCRIPTION,
  ROLE_GUARD.USER_GUARD,
  userController.getMySubscription,
);
userRoute.post(
  USER_ROUTES.CREATE_CHECKOUT_SESSION,
  ROLE_GUARD.USER_GUARD,
  userController.createCheckoutSession,
);

userRoute.post(USER_ROUTES.STRIPE_WEBHOOK, userController.stripeWebhook);

userRoute.get(
  USER_ROUTES.GET_TRAINERS,
  ROLE_GUARD.USER_GUARD,
  userController.getTrainers,
);

userRoute.get(USER_ROUTES.GET_TRAINERS_BY_ID, ROLE_GUARD.USER_GUARD, userController.getTrainerById)

userRoute.patch(
  USER_ROUTES.CHANGE_PASSWORD,
  ROLE_GUARD.USER_GUARD,
  userController.changePassword,
);

userRoute.get(USER_ROUTES.GET_PREFER_TIME,ROLE_GUARD.USER_GUARD,userController.getWorkoutTimes)
userRoute.get(USER_ROUTES.GET_FITNESS_GOALS,ROLE_GUARD.USER_GUARD,userController.getWorkoutGoals)
userRoute.get(USER_ROUTES.GET_ONBOARDING_WORKOUTS,ROLE_GUARD.USER_GUARD,userController.fetchWorkout)
userRoute.get(USER_ROUTES.GET_ONBOARDING_OPTIONS,ROLE_GUARD.USER_GUARD,userController.getOnboardingOptions)

userRoute.post(
  USER_ROUTES.SUBMIT_ONBOARDING,
  ROLE_GUARD.USER_GUARD,
  userController.submitPremiumOnboarding
);

export default userRoute;
