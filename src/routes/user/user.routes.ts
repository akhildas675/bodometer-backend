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
  submitOnboardingSchema,
  trainerIdParamSchema,
  updateUserProfileSchema,
  uploadProfilePictureSchema,
  verifyPaymentSchema,
  exerciseQuerySchema,
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
  USER_ROUTES.GET_EQUIPMENT,
  ROLE_GUARD.USER_GUARD,
  userController.getAllEquipment,
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
  USER_ROUTES.GET_ACTIVE_SUBSCRIPTION,
  ROLE_GUARD.USER_GUARD,
  userController.getActiveSubscription,
);

userRoute.get(
  USER_ROUTES.GET_MY_TRANSACTIONS,
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
  USER_ROUTES.GET_ONBOARDING_QUESTIONS,
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingQuestions,
);

userRoute.post(
  USER_ROUTES.SUBMIT_ONBOARDING, validate(submitOnboardingSchema),
  ROLE_GUARD.USER_GUARD,
  userController.submitOnboarding,
);

userRoute.get(
  USER_ROUTES.GET_ONBOARDING_STATUS,
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingStatus,
);

userRoute.get(
  USER_ROUTES.GET_ONBOARDING_ANSWERS,
  ROLE_GUARD.USER_GUARD,
  userController.getOnboardingAnswers,
);

userRoute.post(
  USER_ROUTES.CALCULATE_BMI_PUBLIC, validate(bmiCalculationSchema),
  userController.calculateBmiPublic,
);

// Exercise routes (premium-only on frontend; backend requires user auth)
userRoute.get(
  USER_ROUTES.GET_EXERCISES,
  validate(exerciseQuerySchema),
  ROLE_GUARD.USER_GUARD,
  userController.getExercises,
);

userRoute.get(
  USER_ROUTES.GET_EXERCISE_BY_ID,
  ROLE_GUARD.USER_GUARD,
  userController.getExerciseById,
);

userRoute.post(
  USER_ROUTES.GENERATE_WORKOUT,
  ROLE_GUARD.USER_GUARD,
  userController.generateWorkout,
);

userRoute.get(
  USER_ROUTES.GET_WORKOUT_PLAN,
  ROLE_GUARD.USER_GUARD,
  userController.getWorkoutPlan,
);

userRoute.get(
  USER_ROUTES.GET_WORKOUT_PLANS,
  ROLE_GUARD.USER_GUARD,
  userController.getWorkoutPlans,
);

userRoute.patch(
  USER_ROUTES.MARK_WORKOUT_DAY,
  ROLE_GUARD.USER_GUARD,
  userController.markDayCompleted,
);

userRoute.patch(
  USER_ROUTES.MARK_WORKOUT_EXERCISE,
  ROLE_GUARD.USER_GUARD,
  userController.markExerciseStatus,
);

export default userRoute;

