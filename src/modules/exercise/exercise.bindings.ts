import { Container } from "inversify";
import { EXERCISE_TYPES } from "./exercise.types";
import ExerciseRepository from "./repositories/exercise.repository";
import { ExerciseService } from "./service/exercise.service";
import { ExerciseController } from "./controller/exercise.controller";
import { IExerciseRepository } from "./interface/exercise-repository.interface";
import { IExerciseService } from "./interface/exercise-service.interface";

export const loadExerciseBindings = (container: Container) => {
    container.bind<IExerciseRepository>(EXERCISE_TYPES.Repository).to(ExerciseRepository);
    container.bind<IExerciseService>(EXERCISE_TYPES.Service).to(ExerciseService);
    container.bind(EXERCISE_TYPES.Controller).to(ExerciseController);
};
