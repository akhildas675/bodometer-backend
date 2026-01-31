import { Router } from "express";
import { authGuard } from "../../middleware/authGuard";
import { documentUpload } from "../../config/multer";
import { createTrainerModule } from "../../modules/trainer/trainer.module";

const trainerRoute = Router();

const {trainerController,trainerProfileController}=createTrainerModule()

trainerRoute.get(
  "/trainer/get-workout-list",
  authGuard(["trainer"]),
  trainerController.getWorkoutList,
);
trainerRoute.post(
  "/trainer/submit-profile-data",
  authGuard(["trainer"]),
  documentUpload.single("certificate"),
  trainerProfileController.createProfile,
);

export default trainerRoute;
