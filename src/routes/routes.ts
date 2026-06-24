import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import trainerRoute from "./trainer/trainer.route";
import { API_ROUTES } from "@/constants/routes.constant/combined.routes.constant";
import categoryRoute from "@/modules/category/routes/category.route";
import subscriptionRoute from "@/modules/subscription/routes/subscription.routes";
import onboardingRoute from "@/modules/onboarding/routes/onboarding.routes";
import targetMuscleRoute from "@/modules/target-muscle/routes/target-muscle.routes";
import equipmentRoute from "@/modules/equipment/routes/equipment.routes";
import exerciseRoute from "@/modules/exercise/routes/exercise.routes";
import { mealCategoryRoute } from "@/modules/meal-category/routes/meal-category.route";
import container from "@/container/container";

const routes = (app: Application) => {
  app.use(API_ROUTES.BASE, authRoute);
  app.use(API_ROUTES.BASE, userRoute);
  app.use(API_ROUTES.BASE, trainerRoute);
  app.use(API_ROUTES.BASE, adminRoute);
  app.use("/api/categories", categoryRoute);
  app.use("/api/subscription", subscriptionRoute);
  app.use("/api/onboarding", onboardingRoute);
  app.use("/api/target-muscles", targetMuscleRoute);
  app.use("/api/equipment", equipmentRoute);
  app.use("/api/exercises", exerciseRoute);
  app.use("/api", mealCategoryRoute(container));
};

export default routes;
