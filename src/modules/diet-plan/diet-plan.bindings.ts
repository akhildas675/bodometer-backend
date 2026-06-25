import { Container } from "inversify";
import { DIET_PLAN_TYPES } from "./diet-plan.types";
import { DietPlanController } from "./controller/diet-plan.controller";
import { IDietPlanService } from "./interface/diet-plan-service.interface";
import { DietPlanService } from "./service/diet-plan.service";
import { IUserDietPlanRepository } from "./interface/user-diet-plan-repository.interface";
import { UserDietPlanRepository } from "./repositories/user-diet-plan.repository";

export function loadDietPlanBindings(container: Container) {
  container.bind<DietPlanController>(DIET_PLAN_TYPES.DietPlanController).to(DietPlanController);
  container.bind<IDietPlanService>(DIET_PLAN_TYPES.DietPlanService).to(DietPlanService);
  container.bind<IUserDietPlanRepository>(DIET_PLAN_TYPES.UserDietPlanRepository).to(UserDietPlanRepository);
}
