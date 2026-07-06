import { Router } from "express";
import { TRAINER_PATHS } from "@/constants/routes.constant/trainer.paths";
import { ROLE_GUARD } from "@/constants/role.guard";
import container from "@/container/container";
import { TrainerController } from "../controller/trainer.controller";
import { TRAINER_TYPES } from "../trainer.types";
import { mediaUpload } from "@/config/multer";
import { validate } from "@/middleware/validate";
import {
  createTrainerProfileSchema,
  updateTrainerProfileSchema,
  uploadProfilePictureSchema,
  uploadTrainerDocumentSchema,

} from "@/modules/trainer/validation/trainer.validator";

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
  trainerController.createProfile.bind(trainerController),
);

trainerRoute.get(
  TRAINER_PATHS.PROFILE,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getTrainer.bind(trainerController),
);

trainerRoute.put(
  TRAINER_PATHS.PROFILE_UPDATE,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateTrainerProfileSchema),
  trainerController.updateProfile.bind(trainerController),
);

trainerRoute.post(
  TRAINER_PATHS.PROFILE_PICTURE,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadProfilePictureSchema),
  trainerController.uploadProfilePicture.bind(trainerController),
);

trainerRoute.post(
  TRAINER_PATHS.DOCUMENT,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadTrainerDocumentSchema),
  trainerController.uploadDocument.bind(trainerController),
);

trainerRoute.get(
  TRAINER_PATHS.PROFILE_STATUS,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getProfileStatus.bind(trainerController),
);


export default trainerRoute;
