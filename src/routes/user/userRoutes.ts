import { Router } from "express";
import UserRepository from "../../repositories/userRepo/user-auth.repo";
import { AuthUserService } from "../../services/userServices/user-auth.services";
import { UserAuthController } from "../../controllers/authController/userAuthController/user-auth.controller";
import { validate } from "../../middleware/validate";
import { registerUserSchema } from "../../validators/userValidations/user-auth.validation";




const userRouter = Router();


//DI

const userRepository = new UserRepository()
const authService = new AuthUserService(userRepository);
const userAuthController = new UserAuthController(authService);

userRouter.post("/auth/register", validate(registerUserSchema), userAuthController.register)

export default userRouter