import { Router } from "express";
import container from "../../../container/container";
import { DIET_PLAN_TYPES } from "../diet-plan.types";
import { DietPlanController } from "../controller/diet-plan.controller";
import { authGuard } from "../../../middleware/authGuard";
import { ROLE_GUARD } from "../../../constants/role.guard";

export const dietPlanRoutes = Router();

const dietPlanController = container.get<DietPlanController>(DIET_PLAN_TYPES.DietPlanController);

// Apply authentication middleware to all routes
dietPlanRoutes.use(ROLE_GUARD.USER_GUARD);

dietPlanRoutes.post("/generate", dietPlanController.generateDietPlan);
dietPlanRoutes.get("/", dietPlanController.getDietPlans);
