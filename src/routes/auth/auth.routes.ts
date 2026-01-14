import { Router } from "express";
import { loginSchema, otpSchema, registerSchema } from "../../validators/auth/auth.validator";
import { AuthController } from "../../controllers/auth/auth.controller";
import { validate } from "../../middleware/validate";
import { AuthService } from "../../services/auth/auth.services";
import { OtpService } from "../../services/otp/otp.services";
import AuthRepository from "../../repositories/auth/auth.repository";
import { MailService } from "../../services/otp/mail.services";

const authRoute = Router()

const mailService = new MailService()
const otpService = new OtpService(mailService)
const authRepository = new AuthRepository()
const authService = new AuthService(authRepository, otpService);
const authController = new AuthController(authService)




authRoute.post('/auth/register', validate(registerSchema), authController.register)

authRoute.post('/auth/otp-verify', validate(otpSchema), authController.verifyOtp)

authRoute.post('/auth/otp-resend', validate(otpSchema), authController.resendOtp)
authRoute.post('/auth/login', validate(loginSchema), authController.login)

authRoute.post("/auth/register/complete", validate(registerSchema), authController.completeRegister);

authRoute.post("/auth/forgot-password", authController.forgotPassword);

authRoute.post("/auth/reset-password", authController.resetPassword);

authRoute.post("/auth/google-login",authController.googleLogin)



export default authRoute;