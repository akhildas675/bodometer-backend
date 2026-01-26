
import { Application } from "express";
import authRoute from "./auth/auth.routes";
import adminRoute from "./admin/admin.routes";
import userRoute from "./user/user.routes";
import trainerRoute from "./trainer/trainer.route";


const routes = (app: Application) => {
  app.use("/api", authRoute);
  app.use("/api",adminRoute)
  app.use("/api",userRoute)
  app.use("/api",trainerRoute)
 
};

export default routes;
