import { Router } from "express";

import { profileUpload, imageUpload } from "@/config/multer";
import { createTrainerModule } from "@/modules/trainer/trainer.module";
import { TRAINER_ROUTES } from "@/constants/routes.constant/trainer-routes.constant";
import { ROLE_GUARD } from "@/constants/role.guard";

const trainerRoute = Router();
const { trainerController } = createTrainerModule();

trainerRoute.get(
  TRAINER_ROUTES.GET_WORKOUT_LIST,
  ROLE_GUARD.TRAINER_GUARD,
  trainerController.getWorkoutList,
);

trainerRoute.post(
  TRAINER_ROUTES.SUBMIT_PROFILE_DATA,
  ROLE_GUARD.TRAINER_GUARD,
  profileUpload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificate", maxCount: 1 },
  ]),
  trainerController .createProfile
)

trainerRoute.get(
  TRAINER_ROUTES.GET_TRAINER_PROFILE, ROLE_GUARD.TRAINER_GUARD, trainerController.getTrainer
);

trainerRoute.put(TRAINER_ROUTES.TRAINER_PROFILE_UPDATE, ROLE_GUARD.TRAINER_GUARD, trainerController.updateProfile)

trainerRoute.post(TRAINER_ROUTES.TRAINER_PROFILE_PICTURE_UPDATE, imageUpload.single("file"), ROLE_GUARD.TRAINER_GUARD, trainerController.uploadProfilePicture)

trainerRoute.get("/trainer/profile/status",ROLE_GUARD.TRAINER_GUARD,trainerController .getProfileStatus)

export default trainerRoute;