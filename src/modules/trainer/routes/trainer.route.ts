import { Router } from "express";
import { TRAINER_PATHS } from "@/constants/routes.constant/trainer.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import container from "@/container/container";
import { TrainerController } from "../controller/trainer.controller";
import { TRAINER_TYPES } from "../trainer.types";
import { mediaUpload } from "@/config/multer";
import { validate } from "@/middleware/validate";
import {
  createTrainerProfileSchema,
  getTrainersSchema,
  profileIdParamSchema,
  updateTrainerProfileSchema,
  uploadProfilePictureSchema,
  uploadTrainerDocumentSchema,
  getTrainerAppointmentsSchema,
  rejectTrainerSchema,
} from "@/modules/trainer/validation/trainer.validator";
import { userIdParamSchema } from "@/modules/user/validation/user.validator";

const trainerRoute = Router();

const trainerController = container.get<TrainerController>(TRAINER_TYPES.TrainerController);

trainerRoute.post(
  TRAINER_PATHS.PROFILE,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate(createTrainerProfileSchema),
  trainerController.submitTrainerProfile,
);

trainerRoute.get(
  TRAINER_PATHS.PROFILE_STATUS,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getTrainerProfileStatus,
);

trainerRoute.get(
  TRAINER_PATHS.PROFILE,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getTrainerProfile,
);

trainerRoute.put(
  TRAINER_PATHS.PROFILE_UPDATE,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateTrainerProfileSchema),
  trainerController.updateTrainerProfile,
);

trainerRoute.post(
  TRAINER_PATHS.PROFILE_PICTURE,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadProfilePictureSchema),
  trainerController.uploadProfilePicture,
);

trainerRoute.post(
  TRAINER_PATHS.COVER_PHOTO,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadProfilePictureSchema),
  trainerController.uploadCoverPhoto,
);

trainerRoute.post(
  TRAINER_PATHS.DOCUMENT,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadTrainerDocumentSchema),
  trainerController.uploadDocument,
);

trainerRoute.get(
  TRAINER_PATHS.TRAINERS,
  ROLE_GUARD.OPTIONAL_AUTH,
  validate(getTrainersSchema),
  trainerController.getTrainers,
);

trainerRoute.get(
  TRAINER_PATHS.APPOINTMENTS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(getTrainerAppointmentsSchema),
  trainerController.getTrainerAppointments,
);

/* Parameterized / Dynamic routes (must be registered after static routes) */
trainerRoute.get(
  TRAINER_PATHS.PROFILE_BY_ID,
  ROLE_GUARD.ADMIN_GUARD,
  validate(profileIdParamSchema),
  trainerController.getTrainerById,
);

trainerRoute.patch(
  TRAINER_PATHS.APPROVE_PROFILE,
  ROLE_GUARD.ADMIN_GUARD,
  validate(profileIdParamSchema),
  trainerController.approveTrainer,
);

trainerRoute.patch(
  TRAINER_PATHS.REJECT_PROFILE,
  ROLE_GUARD.ADMIN_GUARD,
  validate(rejectTrainerSchema),
  trainerController.rejectTrainer,
);

trainerRoute.get(
  TRAINER_PATHS.TRAINER_BY_ID,
  ROLE_GUARD.ALL_GUARDS,
  validate(profileIdParamSchema),
  trainerController.getTrainerById,
);

trainerRoute.patch(
  TRAINER_PATHS.TOGGLE_TRAINER_STATUS,
  ROLE_GUARD.ADMIN_GUARD,
  validate(userIdParamSchema),
  trainerController.toggleStatusTrainer,
);


export default trainerRoute;
