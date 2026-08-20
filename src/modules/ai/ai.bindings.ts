import { Container } from "inversify";
import { AI_TYPES } from "./ai.types";
import { IAiDietService } from "./interface/ai.diet-service.interface";
import { IAiWorkoutService } from "./interface/ai.workout-service.interface";
import { AiDietService } from "@/services/ai-services/ai-diet.service";
import { AiWorkoutService } from "@/services/ai-services/ai-workout.service";

export const loadAiBindings = (container: Container): void => {
  container.bind<IAiDietService>(AI_TYPES.AiDietService).to(AiDietService);
  container.bind<IAiWorkoutService>(AI_TYPES.AiWorkoutService).to(AiWorkoutService);
};
