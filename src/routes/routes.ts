
import { Application } from "express";
import authRoute from "./auth/auth.routes";


const routes = (app: Application) => {
  app.use("/api", authRoute);
 
};

export default routes;
