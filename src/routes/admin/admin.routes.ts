import { Router } from "express";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";
import { createAdminModule } from "../../modules/admin/admin.module";
import { ROLE_GUARD } from "../../constants/role.guard";

import { mediaUpload } from "@/config/multer";

import {
  categoryIdParamSchema,
  categoryUpdateSchema,
  categoryValidationSchema,
  featureIdParamSchema,
  featureUpdateSchema,
  featureValidationSchema,
  getTrainersSchema,
  groupIdParamSchema,
  groupUpdateSchema,
  groupValidationSchema,
  questionIdParamSchema,
  questionUpdateSchema,
  questionValidationSchema,
  subscriptionPlanIdParamSchema,
  subscriptionPlanUpdateSchema,
  subscriptionPlanValidationSchema,
  profileIdParamSchema,
  rejectTrainerSchema,
  userIdParamSchema,
  getTrainerAppointmentsSchema,
  trainerIdParamSchema,
  getUsersSchema,
  createTargetMuscleSchema,
  targetMuscleIdParamSchema,
  updateTargetMuscleSchema,
  createEquipmentSchema,
  equipmentIdParamSchema,
  updateEquipmentSchema,
  createExerciseSchema,
  exerciseIdParamSchema,
  updateExerciseSchema,
  getAllExercisesSchema,
  mealCategoryValidationSchema,
  mealCategoryIdParamSchema,
  updateMealCategorySchema,
  getAllMealCategoriesSchema,
} from "@/validators/admin/admin-validator";
import { validate } from "@/middleware/validate";

const adminRoute = Router();
const { adminController } = createAdminModule();

// Trainer Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINERS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getTrainersSchema),
  adminController.getTrainers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(trainerIdParamSchema),
  adminController.blockTrainer,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(trainerIdParamSchema),
  adminController.unblockTrainer,
);

// Trainer Appointment Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getTrainerAppointmentsSchema),
  adminController.getTrainerAppointments,
);

// Get Trainer by ProfileId
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(profileIdParamSchema),
  adminController.getTrainerById,
);

// Approve Trainer
adminRoute.patch(
  ADMIN_ROUTES.APPROVE_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(profileIdParamSchema),
  adminController.approveTrainer,
);

// Reject Trainer
adminRoute.patch(
  ADMIN_ROUTES.REJECT_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(rejectTrainerSchema),
  adminController.rejectTrainer,
);

// User Management
adminRoute.get(
  ADMIN_ROUTES.GET_USERS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getUsersSchema),
  adminController.getUsers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_USER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(userIdParamSchema),
  adminController.blockUser,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_USER,
  ROLE_GUARD.ADMIN_GUARD,
  validate(userIdParamSchema),
  adminController.unblockUser,
);

adminRoute.post(
  ADMIN_ROUTES.CREATE_CATEGORY,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(categoryValidationSchema),
  adminController.createCategory,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_CATEGORY,
  ROLE_GUARD.ADMIN_GUARD,
  mediaUpload.single("image"),
  validate(categoryUpdateSchema),
  adminController.updateCategory,
);
adminRoute.get(
  ADMIN_ROUTES.GET_CATEGORY_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getCategoryById,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_CATEGORIES,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllCategories,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_CATEGORY_STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(categoryIdParamSchema),
  adminController.toggleCategoryStatus,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_FEATURES,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllSubscriptionFeatures,
);
adminRoute.post(
  ADMIN_ROUTES.CREATE_FEATURE,
  validate(featureValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createSubscriptionFeature,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_FEATURE,
  validate(featureUpdateSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateSubscriptionFeature,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_FEATURE_STATUS,
  validate(featureIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleSubscriptionFeatureStatus,
);
adminRoute.get(
  ADMIN_ROUTES.GET_FEATURE_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getSubscriptionFeatureById,
);
adminRoute.post(
  ADMIN_ROUTES.CREATE_SUBSCRIPTION_PLAN,
  validate(subscriptionPlanValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createSubscriptionPlan,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_SUBSCRIPTION_PLANS,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllSubscriptionPlans,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_SUBSCRIPTION_PLAN_STATUS,
  validate(subscriptionPlanIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleSubscriptionPlanStatus,
);
adminRoute.get(
  ADMIN_ROUTES.GET_SUBSCRIPTION_PLAN_BY_ID,
  validate(subscriptionPlanIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getSubscriptionPlanById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_SUBSCRIPTION_PLAN,
  validate(subscriptionPlanUpdateSchema.merge(subscriptionPlanIdParamSchema)),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateSubscriptionPlan,
);

// Question Group Routes
adminRoute.post(
  ADMIN_ROUTES.CREATE_QUESTION_GROUP,
  ROLE_GUARD.ADMIN_GUARD,
  validate(groupValidationSchema),
  adminController.createQuestionGroup,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_QUESTION_GROUPS,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllQuestionGroups,
);
adminRoute.get(
  ADMIN_ROUTES.GET_QUESTION_GROUP_BY_ID,
  validate(groupIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getQuestionGroupById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_QUESTION_GROUP,
  validate(groupUpdateSchema.merge(groupIdParamSchema)),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateQuestionGroup,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_QUESTION_GROUP_STATUS,
  validate(groupIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleQuestionGroupStatus,
);

// Question Routes
adminRoute.post(
  ADMIN_ROUTES.CREATE_QUESTION,
  validate(questionValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createQuestion,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_QUESTIONS,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllQuestions,
);
adminRoute.get(
  ADMIN_ROUTES.GET_QUESTION_BY_ID,
  validate(questionIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getQuestionById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_QUESTION,
  validate(questionUpdateSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateQuestion,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_QUESTION_STATUS,
  validate(questionIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleQuestionStatus,
);

adminRoute.get(
  ADMIN_ROUTES.GET_QUESTION_DATA_SOURCES,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getQuestionDataSources,
);

// Subscription Transactions
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_SUBSCRIPTION_TRANSACTIONS,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllSubscriptionTransactions,
);

//Target Muscles

adminRoute.post(
  ADMIN_ROUTES.CREATE_TARGET_MUSCLE,
  mediaUpload.single("image"),
  validate(createTargetMuscleSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createTargetMuscle,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_TARGET_MUSCLES,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllTargetMuscles,
);
adminRoute.get(
  ADMIN_ROUTES.GET_TARGET_MUSCLE_BY_ID,
  validate(targetMuscleIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getTargetMuscleById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_TARGET_MUSCLE,
  mediaUpload.single("image"),
  validate(updateTargetMuscleSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateTargetMuscle,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_TARGET_MUSCLE_STATUS,
  validate(targetMuscleIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleTargetMuscleStatus,
);

// Equipment

adminRoute.post(
  ADMIN_ROUTES.CREATE_EQUIPMENT,
  mediaUpload.single("image"),
  validate(createEquipmentSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createEquipment,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_EQUIPMENT,
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllEquipment,
);
adminRoute.get(
  ADMIN_ROUTES.GET_EQUIPMENT_BY_ID,
  validate(equipmentIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getEquipmentById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_EQUIPMENT,
  mediaUpload.single("image"),
  validate(updateEquipmentSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateEquipment,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_EQUIPMENT_STATUS,
  validate(equipmentIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleEquipmentStatus,
);

// Exercises

adminRoute.post(
  ADMIN_ROUTES.CREATE_EXERCISE,
  mediaUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),

  validate(createExerciseSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createExercise,
);
adminRoute.get(
  ADMIN_ROUTES.GET_ALL_EXERCISES,
  validate(getAllExercisesSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllExercises,
);
adminRoute.get(
  ADMIN_ROUTES.GET_EXERCISE_BY_ID,
  validate(exerciseIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getExerciseById,
);
adminRoute.put(
  ADMIN_ROUTES.UPDATE_EXERCISE,
  mediaUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),

  validate(updateExerciseSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateExercise,
);
adminRoute.patch(
  ADMIN_ROUTES.TOGGLE_EXERCISE_STATUS,
  validate(exerciseIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleExerciseStatus,
);

adminRoute.post(
  ADMIN_ROUTES.MEAL_CATEGORY_CREATE,
  validate(mealCategoryValidationSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.createMealCategory,
);

adminRoute.get(
  "/admin/meal-category",
  validate(getAllMealCategoriesSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getAllMealCategories,
);

adminRoute.get(
  "/admin/meal-category/:id",
  validate(mealCategoryIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.getMealCategoryById,
);

adminRoute.put(
  "/admin/meal-category/:id",
  validate(updateMealCategorySchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.updateMealCategory,
);

adminRoute.patch(
  "/admin/meal-category/:id/toggle-status",
  validate(mealCategoryIdParamSchema),
  ROLE_GUARD.ADMIN_GUARD,
  adminController.toggleMealCategoryStatus,
);

export default adminRoute;
