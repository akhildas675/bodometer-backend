import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import trainerRoute from "./trainer/trainer.route";
import adminUserRoute from "./admin/admin-user.routes";
import adminTrainerRoute from "./admin/admin-trainer.routes";
import { API_ROUTES } from "@/constants/routes.constant/combined.routes.constant";

const routes = (app: Application) => {
  app.use(API_ROUTES.BASE, authRoute);
  app.use(API_ROUTES.BASE, userRoute);
  app.use(API_ROUTES.BASE, trainerRoute);
  app.use(API_ROUTES.BASE, adminRoute);

  //admin sub routes
  app.use(API_ROUTES.BASE, adminUserRoute)
  app.use(API_ROUTES.BASE, adminTrainerRoute)
};

export default routes;
