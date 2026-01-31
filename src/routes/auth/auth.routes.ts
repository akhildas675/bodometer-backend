import { Router } from "express";
import {
  loginSchema,
  otpSchema,
  registerSchema,
} from "../../validators/auth/auth.validator";
import { validate } from "../../middleware/validate";
import { createAuthModule } from "../../modules/auth/auth.module";

const authRoute = Router();

const { authController } = createAuthModule();

authRoute.post(
  "/auth/register",
  validate(registerSchema),
  authController.register,
);

authRoute.post(
  "/auth/otp-verify",
  validate(otpSchema),
  authController.verifyOtp,
);

authRoute.post(
  "/auth/otp-resend",
  validate(otpSchema),
  authController.resendOtp,
);
authRoute.post("/auth/login", validate(loginSchema), authController.login);

authRoute.post(
  "/auth/register/complete",
  validate(registerSchema),
  authController.completeRegister,
);

authRoute.post("/auth/forgot-password", authController.forgotPassword);

authRoute.post("/auth/reset-password", authController.resetPassword);

authRoute.post("/auth/google-login", authController.googleLogin);
authRoute.post("/auth/refresh-token", authController.refreshToken);
authRoute.post("/auth/logout", authController.logout);

export default authRoute;
