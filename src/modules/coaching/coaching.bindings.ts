import { Container } from "inversify";
import { ICoachingRepository } from "./interface/coaching-repository.interface";
import { COACHING_TYPES } from "./coaching.types";
import CoachingRepository from "./repositories/coaching.repository";
import { CoachingService } from "./service/coaching.service";
import { ICoachingService } from "./interface/coaching-service.interface";
import { CoachingController } from "./controller/coaching.controller";

export const loadCoachingBindings=(
    container:Container
)=>{
    container.bind<ICoachingRepository>(COACHING_TYPES.CoachingRepository)
    .to(CoachingRepository);

    container.bind<ICoachingService>(COACHING_TYPES.CoachingService)
    .to(CoachingService);

    container.bind(COACHING_TYPES.CoachingController)
    .to(CoachingController);
}