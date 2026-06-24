import { Router } from "express";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";
import { createAdminModule } from "../../moduless/admin/admin.module";
import { ROLE_GUARD } from "../../constants/role.guard";

import { mediaUpload } from "@/config/multer";

import {
 
  getTrainersSchema,

  profileIdParamSchema,
  rejectTrainerSchema,
  userIdParamSchema,
  getTrainerAppointmentsSchema,
  trainerIdParamSchema,
  getUsersSchema,

} from "@/validators/admin/admin-validator";
import { validate } from "@/middleware/validate";

const adminRoute = Router();
const { adminController } = createAdminModule();


// Trainer Management
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

// Subscription Transactions


//Target Muscles




export default adminRoute;
