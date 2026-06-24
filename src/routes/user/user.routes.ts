import { Router } from "express";
import { createUserModule } from "../../moduless/user/user.module";
import { USER_ROUTES } from "../../constants/routes.constant/user-routes.constant";
import { ROLE_GUARD } from "../../constants/role.guard";
import { validate } from "../../middleware/validate";
import {
  bmiCalculationSchema,
  changePasswordSchema,

  submitOnboardingSchema,
  trainerIdParamSchema,
  updateUserProfileSchema,
  uploadProfilePictureSchema,

  exerciseQuerySchema,
  getTrainerSlotsSchema,
  createBookingSchema,
  getUserBookingsSchema,
  cancelBookingSchema,
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
  USER_ROUTES.GET_MEAL_CATEGORIES,
  ROLE_GUARD.USER_GUARD,
  userController.getMealCategories,
);

userRoute.get(
  USER_ROUTES.GET_HEALTH_LOG,
  ROLE_GUARD.USER_GUARD,
  userController.getHealthLog,
);

userRoute.post(
  USER_ROUTES.UPSERT_HEALTH_LOG,
  ROLE_GUARD.USER_GUARD,
  userController.upsertHealthLog,
);

userRoute.get(
  USER_ROUTES.GET_HEALTH_LOG_PROGRESS,
  ROLE_GUARD.USER_GUARD,
  userController.getHealthLogProgress,
);

userRoute.get(
  USER_ROUTES.GET_EQUIPMENT,
  ROLE_GUARD.USER_GUARD,
  userController.getAllEquipment,
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

userRoute.get(
  USER_ROUTES.GET_WORKOUT_PROGRESS,
  ROLE_GUARD.USER_GUARD,
  userController.getWorkoutProgress,
);

// Bookings
userRoute.get(
  USER_ROUTES.GET_TRAINER_SLOTS,
  validate(getTrainerSlotsSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getAvailableSlots,
);

userRoute.post(
  USER_ROUTES.CREATE_BOOKING,
  validate(createBookingSchema),
  ROLE_GUARD.USER_GUARD,
  userController.createBooking,
);

userRoute.get(
  USER_ROUTES.GET_USER_BOOKINGS,
  validate(getUserBookingsSchema),
  ROLE_GUARD.USER_GUARD,
  userController.getMyBookings,
);

userRoute.patch(
  USER_ROUTES.CANCEL_BOOKING,
  validate(cancelBookingSchema),
  ROLE_GUARD.USER_GUARD,
  userController.cancelBooking,
);

export default userRoute;

