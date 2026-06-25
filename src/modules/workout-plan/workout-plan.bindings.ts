import { Container } from "inversify";
import { WORKOUT_PLAN_TYPES } from "./workout-plan.types";
import { WorkoutPlanController } from "./controller/workout-plan.controller";
import { IWorkoutPlanService } from "./interface/workout-plan-service.interface";
import { WorkoutPlanService } from "./service/workout-plan.service";
import { IUserWorkoutPlanRepository } from "./interface/user-workout-plan-repository.interface";
import { UserWorkoutPlanRepository } from "./repositories/user-workout-plan.repository";

export const loadWorkoutPlanBindings = (container: Container) => {
    container.bind<WorkoutPlanController>(WORKOUT_PLAN_TYPES.WorkoutPlanController).to(WorkoutPlanController);
    container.bind<IWorkoutPlanService>(WORKOUT_PLAN_TYPES.WorkoutPlanService).to(WorkoutPlanService);
    container.bind<IUserWorkoutPlanRepository>(WORKOUT_PLAN_TYPES.UserWorkoutPlanRepository).to(UserWorkoutPlanRepository);
};
