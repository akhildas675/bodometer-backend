import { Router } from "express";
import { ADMIN_ROUTES } from "@/constants/routes.constant/admin-routes.constant";
import { createAdminTrainerModule } from "@/modules/admin/admin-trainer.module";
import { ROLE_GUARD } from "@/constants/role.guard";
import { validate } from "@/middleware/validate";
import { getTrainerAppointmentsSchema, getTrainersSchema, profileIdParamSchema, rejectTrainerSchema, trainerIdParamSchema } from "@/validators/admin/admin-trainer.validator";
import { profile } from "console";

const adminTrainerRoute = Router()
const {adminTrainerController} = createAdminTrainerModule()

// Trainer Management
adminTrainerRoute.get(
  ADMIN_ROUTES.GET_TRAINERS,
  ROLE_GUARD.ADMIN_GUARD,validate(getTrainersSchema),
  adminTrainerController.getTrainers,
);

adminTrainerRoute.patch(
  ADMIN_ROUTES.BLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,validate(trainerIdParamSchema),
  adminTrainerController.blockTrainer,
);

adminTrainerRoute.patch(
  ADMIN_ROUTES.UNBLOCK_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,validate(trainerIdParamSchema),
  adminTrainerController.unblockTrainer,
);


// Trainer Appointment Management
adminTrainerRoute.get(
  ADMIN_ROUTES.GET_TRAINER_APPOINTMENTS,
  ROLE_GUARD.ADMIN_GUARD,validate(getTrainerAppointmentsSchema),
  adminTrainerController.getTrainerAppointments,
);

// Get Trainer by ProfileId
adminTrainerRoute.get(
  ADMIN_ROUTES.GET_TRAINER_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,validate(profileIdParamSchema),
  adminTrainerController.getTrainerById,
);

// Approve Trainer
adminTrainerRoute.patch(
  ADMIN_ROUTES.APPROVE_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,validate(profileIdParamSchema),
  adminTrainerController.approveTrainer,
);

// Reject Trainer
adminTrainerRoute.patch(
  ADMIN_ROUTES.REJECT_TRAINER,
  ROLE_GUARD.ADMIN_GUARD,validate(rejectTrainerSchema),
  adminTrainerController.rejectTrainer,
);


export default adminTrainerRoute