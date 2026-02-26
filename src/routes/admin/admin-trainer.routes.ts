import { Router } from "express";
import { ADMIN_ROUTES } from "../../constants/routes.constant/admin-routes.constant";
import { createAdminTrainerModule } from "../../modules/admin/admin-trainer.module";
import { ROLE_GUARD } from "../../constants/role.guard";

const adminTrainerRoute = Router()
const {adminTrainerController} = createAdminTrainerModule()

// Trainer Management
adminTrainerRoute.get(
  ADMIN_ROUTES.GET_TRAINERS,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.getTrainers,
);

adminTrainerRoute.patch(
  ADMIN_ROUTES.BLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.blockTrainer,
);

adminTrainerRoute.patch(
  ADMIN_ROUTES.UNBLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.unblockTrainer,
);


// Trainer Appointment Management
adminTrainerRoute.get(
  ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.getTrainerAppointments,
);

// Get Trainer by ProfileId
adminTrainerRoute.get(
  ADMIN_ROUTES.GET_TRAINER_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.getTrainerById,
);

// Approve Trainer
adminTrainerRoute.patch(
  ADMIN_ROUTES.APPROVE_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.approveTrainer,
);

// Reject Trainer
adminTrainerRoute.patch(
  ADMIN_ROUTES.REJECT_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,
  adminTrainerController.rejectTrainer,
);


export default adminTrainerRoute