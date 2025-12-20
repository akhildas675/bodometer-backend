import { Router } from "express";
import UserRepository from "../../repositories/userRepo/user-auth.repo";
import { AuthUserService } from "../../services/authServices/user-auth.services";
import { UserAuthController } from "../../controllers/authController/userAuthController/user-auth.controller";
import { validate } from "../../middleware/validate";
import { loginUserSchema, registerUserSchema } from "../../validators/userValidations/user-auth.validation";
import { OtpService } from "../../services/otp/otp.services";




const userRouter = Router();


//DI

const userRepository = new UserRepository()
const otpService = new OtpService();
const authService = new AuthUserService(userRepository,otpService);
const userAuthController = new UserAuthController(authService,otpService);

userRouter.post("/auth/user-register", validate(registerUserSchema), userAuthController.register);
userRouter.post("/auth/user-login",validate(loginUserSchema),userAuthController.login);
userRouter.post ("/auth/refresh",userAuthController.refresh);
userRouter.post("/auth/user-otp-verify",userAuthController.verifyRegisterOtp)
userRouter.post("/auth/user-resend-otp",userAuthController.resendOtp)
userRouter.post("/auth/user-logout", userAuthController.logout);


export default userRouter