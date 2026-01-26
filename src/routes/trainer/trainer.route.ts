import { Router } from "express";
import userRoute from "../user/user.routes";
import { authGuard } from "../../middleware/authGuard";
import TrainerRepository from "../../repositories/trainer/trainer.repository";
import { TrainerService } from "../../services/trainer/trainer.services";
import { TrainerController } from "../../controllers/trainer/trainer.controller";
import TrainerProfileController from "../../controllers/trainer/trainer-profile.controller";
import TrainerProfileService from "../../services/trainer/trainer-profile.service";
import TrainerProfileRepository from "../../repositories/trainer/trainer-profile.repository";
import { documentUpload } from "../../config/multer";

const trainerRoute = Router();

const trainerRepository = new TrainerRepository();
const trainerService = new TrainerService(trainerRepository);
const trainerController = new TrainerController(trainerService)
const trainerProfileRepository = new TrainerProfileRepository()
const trainerProfileService = new TrainerProfileService(trainerProfileRepository)
const trainerProfileController = new TrainerProfileController(trainerProfileService)

trainerRoute.get("/trainer/get-workout-list", authGuard(["trainer"]), trainerController.getWorkoutList)
trainerRoute.post(
    "/trainer/submit-profile-data",
    authGuard(["trainer"]),
    documentUpload.single("certificate"),
    trainerProfileController.createProfile
);


export default trainerRoute