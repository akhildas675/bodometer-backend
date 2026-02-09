import { Router } from "express";
import { authGuard } from "../../middleware/authGuard";
import { documentUpload, imageUpload } from "../../config/multer";
import { createTrainerModule } from "../../modules/trainer/trainer.module";
import { TRAINER_ROUTES } from "../../constants/routes.constant/trainer-routes.constant";

const trainerRoute = Router();
const { trainerController, trainerProfileController } = createTrainerModule();

trainerRoute.get(
  TRAINER_ROUTES.GET_WORKOUT_LIST,
  authGuard(["trainer"]),
  trainerController.getWorkoutList,
);

trainerRoute.post(
  TRAINER_ROUTES.SUBMIT_PROFILE_DATA,
  authGuard(["trainer"]),
  documentUpload.single("certificate"),
  trainerProfileController.createProfile,
);


trainerRoute.get(
  TRAINER_ROUTES.GET_TRAINER_PROFILE, authGuard(["trainer"]), trainerController.getTrainer
);

trainerRoute.put(TRAINER_ROUTES.TRAINER_PROFILE_UPDATE,authGuard(["trainer"]),trainerController.updateProfile)

trainerRoute.post(TRAINER_ROUTES.TRAINER_PROFILE_PICTURE_UPDATE,imageUpload.single("file"),authGuard(["trainer"]),trainerController.uploadProfilePicture)

export default trainerRoute;