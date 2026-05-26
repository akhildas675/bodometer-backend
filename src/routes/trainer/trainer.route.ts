import { Router } from "express";
import { TRAINER_ROUTES } from "../../constants/routes.constant/trainer-routes.constant";
import { ROLE_GUARD } from "../../constants/role.guard";
import { createTrainerModule } from "../../modules/trainer/trainer.module";
import { mediaUpload } from "../../config/multer";
import { validate } from "@/middleware/validate";
import { createTrainerProfileSchema, updateTrainerProfileSchema, uploadProfilePictureSchema, uploadTrainerDocumentSchema } from "@/validators/trainer/trainer.validator";
const trainerRoute = Router();
const { trainerController } = createTrainerModule();

trainerRoute.post(
  TRAINER_ROUTES.SUBMIT_PROFILE_DATA,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  validate(createTrainerProfileSchema),
  trainerController.createProfile,
);

trainerRoute.get(
  TRAINER_ROUTES.GET_TRAINER_PROFILE,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getTrainer,
);

trainerRoute.put(
  TRAINER_ROUTES.TRAINER_PROFILE_UPDATE,
  ROLE_GUARD.TRAINER_GUARD,
  validate(updateTrainerProfileSchema),
  trainerController.updateProfile,
);

trainerRoute.post(
  TRAINER_ROUTES.TRAINER_PROFILE_PICTURE_UPDATE,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadProfilePictureSchema),
  trainerController.uploadProfilePicture,
);

trainerRoute.post(
  TRAINER_ROUTES.UPLOAD_DOCUMENT,
  ROLE_GUARD.TRAINER_GUARD,
  mediaUpload.single("file"),
  validate(uploadTrainerDocumentSchema),
  trainerController.uploadDocument,
);

trainerRoute.get(
  TRAINER_ROUTES.GET_PROFILE_STATUS,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getProfileStatus,
);
trainerRoute.get(
  TRAINER_ROUTES.GET_CATEGORIES,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getCategories,
);

export default trainerRoute;
