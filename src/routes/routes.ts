
import { Application } from "express";
import userRouter from "./user/userRoutes";

const routes = (app: Application) => {
  
  app.use("/api/user", userRouter);
};

export default routes;
