import { Router } from "express";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";
import { createAdminModule } from "../../modules/admin/admin.module";
import { ROLE_GUARD } from "../../constants/role.guard";
import { validate } from "../../middleware/validate";
import {
  getTrainersSchema,
  trainerIdParamSchema,
  getTrainerAppointmentsSchema,
  profileIdParamSchema,
  rejectTrainerSchema,
} from "../../validators/admin/admin-trainer.validator";
import {
  getUsersSchema,
  userIdParamSchema,
} from "../../validators/admin/admin-user.validator";
import { mediaUpload } from "@/config/multer";

const adminRoute = Router();
const { adminController } = createAdminModule();


// Trainer Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINERS,
  ROLE_GUARD.ADMIN_GUARD, validate(getTrainersSchema),
  adminController.getTrainers,
);

adminRoute.patch(
  ADMIN_ROUTES.BLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(trainerIdParamSchema),
  adminController.blockTrainer,
);

adminRoute.patch(
  ADMIN_ROUTES.UNBLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(trainerIdParamSchema),
  adminController.unblockTrainer,
);


// Trainer Appointment Management
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS,
  ROLE_GUARD.ADMIN_GUARD, validate(getTrainerAppointmentsSchema),
  adminController.getTrainerAppointments,
);

// Get Trainer by ProfileId
adminRoute.get(
  ADMIN_ROUTES.GET_TRAINER_BY_ID,
  ROLE_GUARD.ADMIN_GUARD, validate(profileIdParamSchema),
  adminController.getTrainerById,
);

// Approve Trainer
adminRoute.patch(
  ADMIN_ROUTES.APPROVE_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(profileIdParamSchema),
  adminController.approveTrainer,
);

// Reject Trainer
adminRoute.patch(
  ADMIN_ROUTES.REJECT_TRAINER,
  ROLE_GUARD.ADMIN_GUARD, validate(rejectTrainerSchema),
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


adminRoute.post(ADMIN_ROUTES.CREATE_CATEGORY, ROLE_GUARD.ADMIN_GUARD, mediaUpload.single("image"), adminController.createCategory)
adminRoute.put(ADMIN_ROUTES.UPDATE_CATEGORY, ROLE_GUARD.ADMIN_GUARD, mediaUpload.single("image"), adminController.updateCategory)
adminRoute.get(ADMIN_ROUTES.GET_CATEGORY_BY_ID, ROLE_GUARD.ADMIN_GUARD, adminController.getCategoryById)
adminRoute.get(ADMIN_ROUTES.GET_ALL_CATEGORIES, ROLE_GUARD.ADMIN_GUARD, adminController.getAllCategories)
adminRoute.patch(ADMIN_ROUTES.TOGGLE_CATEGORY_STATUS, ROLE_GUARD.ADMIN_GUARD, adminController.toggleCategoryStatus)
adminRoute.get(ADMIN_ROUTES.GET_ALL_FEATURES, ROLE_GUARD.ADMIN_GUARD, adminController.getAllSubscriptionFeatures)
adminRoute.post(ADMIN_ROUTES.CREATE_FEATURE, ROLE_GUARD.ADMIN_GUARD, adminController.createSubscriptionFeature)
adminRoute.patch(ADMIN_ROUTES.UPDATE_FEATURE, ROLE_GUARD.ADMIN_GUARD, adminController.updateSubscriptionFeature)
adminRoute.patch(ADMIN_ROUTES.TOGGLE_FEATURE_STATUS, ROLE_GUARD.ADMIN_GUARD, adminController.toggleSubscriptionFeatureStatus)
adminRoute.get(ADMIN_ROUTES.GET_FEATURE_BY_ID, ROLE_GUARD.ADMIN_GUARD, adminController.getSubscriptionFeatureById)
adminRoute.post(ADMIN_ROUTES.CREATE_SUBSCRIPTION_PLAN, ROLE_GUARD.ADMIN_GUARD, adminController.createSubscriptionPlan)
adminRoute.get(ADMIN_ROUTES.GET_ALL_SUBSCRIPTION_PLANS, ROLE_GUARD.ADMIN_GUARD, adminController.getAllSubscriptionPlans)
adminRoute.patch(ADMIN_ROUTES.TOGGLE_SUBSCRIPTION_PLAN_STATUS, ROLE_GUARD.ADMIN_GUARD, adminController.toggleSubscriptionPlanStatus)
adminRoute.get(ADMIN_ROUTES.GET_SUBSCRIPTION_PLAN_BY_ID, ROLE_GUARD.ADMIN_GUARD, adminController.getSubscriptionPlanById)
adminRoute.put(ADMIN_ROUTES.UPDATE_SUBSCRIPTION_PLAN, ROLE_GUARD.ADMIN_GUARD, adminController.updateSubscriptionPlan)


export default adminRoute;