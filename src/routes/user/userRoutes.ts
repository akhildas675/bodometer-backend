import { Router } from "express";
import UserRepository from "../../repositories/userRepo/user-auth.repo";
import { AuthUserService } from "../../services/authServices/user-auth.services";
import { UserAuthController } from "../../controllers/authController/userAuthController/user-auth.controller";
import { validate } from "../../middleware/validate";
import { loginUserSchema, registerUserSchema } from "../../validators/userValidations/user-auth.validation";




const userRouter = Router();


//DI

const userRepository = new UserRepository()
const authService = new AuthUserService(userRepository);
const userAuthController = new UserAuthController(authService);

userRouter.post("/auth/user-register", validate(registerUserSchema), userAuthController.register);
userRouter.post("/auth/user-login",validate(loginUserSchema),userAuthController.login);
userRouter.post ("/auth/refresh",userAuthController.refresh);
userRouter.post("/auth/user-logout", userAuthController.logout);


export default userRouter