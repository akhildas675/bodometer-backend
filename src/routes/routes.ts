import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import trainerRoute from "./trainer/trainer.route";
import { API_ROUTES } from "@/constants/routes.constant/combined.routes.constant";
import categoryRoute from "@/modules/category/routes/category.route";
import subscriptionRoute from "@/modules/subscription/routes/subscription.routes";

const routes = (app: Application) => {
  app.use(API_ROUTES.BASE, authRoute);
  app.use(API_ROUTES.BASE, userRoute);
  app.use(API_ROUTES.BASE, trainerRoute);
  app.use(API_ROUTES.BASE, adminRoute);
  app.use("/api/categories", categoryRoute);
  app.use("/api/subscription",subscriptionRoute)

};

export default routes;
