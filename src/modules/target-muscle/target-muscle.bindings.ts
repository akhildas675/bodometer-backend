import { Container } from "inversify";
import { TARGET_MUSCLE_TYPES } from "./target-muscle.types";
import TargetMuscleRepository from "./repositories/target-muscle.repository";
import { TargetMuscleService } from "./service/target-muscle.service";
import { TargetMuscleController } from "./controller/target-muscle.controller";
import { ITargetMuscleRepository } from "./interface/target-muscle-repository.interface";
import { ITargetMuscleService } from "./interface/target-muscle-service.interface";


export const loadTargetMuscleBindings = (container: Container) => {
    container.bind<ITargetMuscleRepository>(TARGET_MUSCLE_TYPES.Repository).to(TargetMuscleRepository);
    container.bind<ITargetMuscleService>(TARGET_MUSCLE_TYPES.Service).to(TargetMuscleService);
    container.bind(TARGET_MUSCLE_TYPES.Controller).to(TargetMuscleController);
};
