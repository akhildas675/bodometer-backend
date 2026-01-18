
import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";


const routes = (app: Application) => {
  app.use("/api", authRoute);
  app.use("/api",adminRoute)
 
};

export default routes;
