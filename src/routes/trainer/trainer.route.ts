import { Router } from "express";
import userRoute from "../user/user.routes";
import { authGuard } from "../../middleware/authGuard";
import TrainerRepository from "../../repositories/trainer/trainer.repository";
import { TrainerService } from "../../services/trainer/trainer.services";
import { TrainerController } from "../../controllers/trainer/trainer.controller";
import { upload } from "../../config/multer";
import TrainerProfileController from "../../controllers/trainer/trainer-profile.controller";
import TrainerProfileService from "../../services/trainer/trainer-profile.service";
import TrainerProfileRepository from "../../repositories/trainer/trainer-profile.repository";

const trainerRoute = Router();

const trainerRepository = new TrainerRepository();
const trainerService = new TrainerService(trainerRepository);
const trainerController = new TrainerController(trainerService)
const trainerProfileRepository =new TrainerProfileRepository()
const trainerProfileService = new TrainerProfileService(trainerProfileRepository)
const trainerProfileController = new TrainerProfileController(trainerProfileService)

userRoute.get("/trainer/get-workout-list",authGuard(["trainer"]),trainerController.getWorkoutList)
trainerRoute.post(
  "/trainer/profile",
  authGuard(["trainer"]),
  upload.single("certificate"),
  trainerProfileController.createProfile
);


export default trainerRoute