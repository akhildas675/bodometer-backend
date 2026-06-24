import { Container } from "inversify";
import { MEAL_TYPES } from "./meal.types";
import { IMealService } from "./interface/meal-service.interface";
import { MealService } from "./service/meal.service";

export const loadMealBindings = (container: Container) => {
  container.bind<IMealService>(MEAL_TYPES.IMealService).to(MealService);
};
