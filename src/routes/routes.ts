
import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";


const routes = (app: Application) => {
  app.use("/api", authRoute);
  app.use("/api",adminRoute)
  app.use("/api",userRoute)
 
};

export default routes;
