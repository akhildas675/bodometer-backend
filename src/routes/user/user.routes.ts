import { Router } from "express";
import { createUserModule } from "../../modules/user/user.module";
import { USER_ROUTES } from "../../constants/routes.constant/user-routes.constant";
import { ROLE_GUARD } from "../../constants/role.guard";
import { validate } from "../../middleware/validate";
import {
  bmiCalculationSchema,
  categoryIdParamSchema,
  changePasswordSchema,
  checkoutSessionSchema,
  groupIdParamSchema,
  submitOnboardingSchema,
  subscriptionIdParamSchema,
  trainerIdParamSchema,
  updateUserProfileSchema,
  uploadProfilePictureSchema,
  verifyPaymentSchema,
} from "../../validators/user/user.validator";
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

userRoute.get(
  USER_ROUTES.GET_TRAINERS,
  ROLE_GUARD.USER_GUARD,
  userController.getTrainers,
);

userRoute.get(
  USER_ROUTES.GET_TRAINERS_BY_ID, validate(trainerIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getTrainerById,
);

userRoute.patch(
  USER_ROUTES.CHANGE_PASSWORD, validate(changePasswordSchema),
  ROLE_GUARD.USER_GUARD,
  userController.changePassword,
);

userRoute.get(
  USER_ROUTES.GET_CATEGORIES,
  ROLE_GUARD.USER_GUARD,
  userController.getCategories,
);

userRoute.get(
  USER_ROUTES.GET_CATEGORY_BY_ID, validate(categoryIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getCategoryById,
);

userRoute.get(
  USER_ROUTES.GET_MY_SUBSCRIPTIONS,
  ROLE_GUARD.USER_GUARD,
  userController.getMySubscriptions,
);

userRoute.post(
  USER_ROUTES.CHECKOUT_SESSION, validate(checkoutSessionSchema),
  ROLE_GUARD.USER_GUARD,
  userController.createCheckoutSession,
);

userRoute.get(
  USER_ROUTES.VERIFY_PAYMENT, validate(verifyPaymentSchema),
  ROLE_GUARD.USER_GUARD,
  userController.verifyPayment,
);

userRoute.get(
  USER_ROUTES.GET_ACTIVE_SUBSCRIPTION, validate(subscriptionIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getActiveSubscription,
);

userRoute.get(
  USER_ROUTES.GET_MY_TRANSACTIONS, validate(subscriptionIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getUserTransactions,
);

// onboarding routes
userRoute.get(
  USER_ROUTES.GET_ONBOARDING_GROUPS,
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingGroups,
);

userRoute.get(
  USER_ROUTES.GET_ONBOARDING_QUESTIONS, validate(groupIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingQuestions,
);

userRoute.post(
  USER_ROUTES.SUBMIT_ONBOARDING, validate(submitOnboardingSchema),
  ROLE_GUARD.USER_GUARD,
  userController.submitOnboarding,
);

userRoute.get(
  USER_ROUTES.GET_ONBOARDING_STATUS, validate(groupIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingStatus,
);

userRoute.get(
  USER_ROUTES.GET_ONBOARDING_ANSWERS, validate(groupIdParamSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingAnswers,
);

userRoute.post(
  USER_ROUTES.CALCULATE_BMI_PUBLIC, validate(bmiCalculationSchema),
  userController.calculateBmiPublic,
);

export default userRoute;
