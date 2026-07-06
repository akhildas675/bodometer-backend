import { ITrainerProfileRepository } from '@/modules/trainer/interface/trainer.profile-repository.interface';
import { Container } from "inversify";
import { TRAINER_TYPES } from "./trainer.types";
import TrainerProfileRepository from "./repository/trainer-profile.repository";
import { ITrainerService } from '@/modules/trainer/interface/trainer-service.interface';
import { TrainerController } from "./controller/trainer.controller";
import { TrainerService } from "./service/trainer.services";

export const loadTrainerBindings=(
    container:Container
)=>{

    container.bind<ITrainerProfileRepository>(TRAINER_TYPES.TrainerProfileRepository)
    .to(TrainerProfileRepository);

    container.bind<ITrainerService>(TRAINER_TYPES.TrainerService)
    .to(TrainerService)

    container.bind<TrainerController>(TRAINER_TYPES.TrainerController)
    .to(TrainerController)

}