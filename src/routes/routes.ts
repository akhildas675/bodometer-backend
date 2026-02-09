import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import trainerRoute from "./trainer/trainer.route";
import { API_ROUTES } from "../constants/routes.constant/combained.routes.constant";

const routes = (app: Application) => {
  app.use(API_ROUTES.BASE, authRoute);
  app.use(API_ROUTES.BASE, adminRoute);
  app.use(API_ROUTES.BASE, userRoute);
  app.use(API_ROUTES.BASE, trainerRoute);
};

export default routes;
