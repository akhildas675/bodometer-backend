import { Application } from "express";
import authRoute from "../modules/auth/routes/auth.routes";
import userRoute from "../modules/user/routes/user.routes";
import categoryRoute from "@/modules/category/routes/category.route";
import subscriptionRoute from "@/modules/subscription/routes/subscription.routes";
import onboardingRoute from "@/modules/onboarding/routes/onboarding.routes";
import targetMuscleRoute from "@/modules/target-muscle/routes/target-muscle.routes";
import equipmentRoute from "@/modules/equipment/routes/equipment.routes";
import exerciseRoute from "@/modules/exercise/routes/exercise.routes";
import mealCategoryRoute from "@/modules/meal-category/routes/meal-category.route";
import healthLogRoute from "@/modules/health-log/routes/health-log.routes";
import workoutPlanRoute from "@/modules/workout-plan/routes/workout-plan.routes";
import trainerRoute from "@/modules/trainer/routes/trainer.route";
import { dietPlanRoutes } from "@/modules/diet-plan/routes/diet-plan.routes";
import { API_MOUNTS } from "@/constants/routes.constant/api.mounts";

const routes = (app: Application) => {
  app.use(API_MOUNTS.AUTH, authRoute);
  app.use(API_MOUNTS.USER, userRoute);
  app.use(API_MOUNTS.TRAINER, trainerRoute);
  app.use(API_MOUNTS.WORKOUT_PLAN, workoutPlanRoute);
  app.use(API_MOUNTS.CATEGORY, categoryRoute);
  app.use("/api/subscription", subscriptionRoute);
  app.use("/api/onboarding", onboardingRoute);
  app.use("/api/target-muscles", targetMuscleRoute);
  app.use("/api/equipment", equipmentRoute);
  app.use("/api/exercises", exerciseRoute);
  app.use("/api/meal-categories", mealCategoryRoute);
  app.use("/api/user/health-log", healthLogRoute);
  app.use("/api/user/diet-plan", dietPlanRoutes);
};

export default routes;
