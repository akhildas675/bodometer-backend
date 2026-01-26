import { Router } from "express";
import userRoute from "../user/user.routes";
import { authGuard } from "../../middleware/authGuard";
import TrainerRepository from "../../repositories/trainer/trainer.repository";
import { TrainerService } from "../../services/trainer/trainer.services";
import { TrainerController } from "../../controllers/trainer/trainer.controller";

const trainerRoute = Router();

const trainerRepository = new TrainerRepository();
const trainerService = new TrainerService(trainerRepository);
const trainerController = new TrainerController(trainerService)

userRoute.get("/trainer/get-workout-list",authGuard(["trainer"]),trainerController.getWorkoutList)

export default trainerRoute