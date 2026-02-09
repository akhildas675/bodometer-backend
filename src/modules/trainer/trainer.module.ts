import TrainerProfileController from "../../controllers/trainer/trainer-profile.controller";
import { TrainerController } from "../../controllers/trainer/trainer.controller";
import { IS3Service } from "../../interfaces/s3/s3-service.interface";
import { ITrainerRepository } from "../../interfaces/trainer/trainer-repository.interface";
import { ITrainerService } from "../../interfaces/trainer/trainer-service.interface";
import { ITrainerProfileRepository } from "../../interfaces/trainer/trainer.profile-repository.interface";
import { ITrainerProfileService } from "../../interfaces/trainer/trainer.profile-service.interface";
import TrainerProfileRepository from "../../repositories/trainer/trainer-profile.repository";
import TrainerRepository from "../../repositories/trainer/trainer.repository";
import { S3Service } from "../../services/s3/s3.service";
import TrainerProfileService from "../../services/trainer/trainer-profile.service";
import { TrainerService } from "../../services/trainer/trainer.services";

export function createTrainerModule(){
    const trainerRepository:ITrainerRepository = new TrainerRepository();
    const trainerProfileRepository:ITrainerProfileRepository= new TrainerProfileRepository();
    const s3Service:IS3Service = new S3Service()


    const trainerService:ITrainerService = new TrainerService(
        trainerRepository,
        s3Service,
    );


    const trainerProfileService:ITrainerProfileService = new TrainerProfileService(
        trainerProfileRepository,
        s3Service
    )

    const trainerController = new TrainerController(trainerService)
    const trainerProfileController = new TrainerProfileController(trainerProfileService)

    return {trainerController,trainerProfileController}
}