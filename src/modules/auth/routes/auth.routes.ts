import { Router } from "express";
import { validate } from "@/middleware/validate";
import { AuthController } from "../controller/auth.controller";
import container from "@/container/container";
import { AUTH_TYPES } from "../auth.types";
import { forgotPasswordSchema, googleLoginSchema, loginSchema, registerSchema, resendOtpSchema, resetPasswordSchema, verifyOtpSchema } from "../validation/auth.validation";
import { AUTH_PATHS } from "@/constants/routes.constant/auth.paths";

const authRoute = Router();
const authController = container.get<AuthController>(AUTH_TYPES.AuthController)

authRoute.post(
  AUTH_PATHS.REGISTER,
  validate(registerSchema),
  authController.requestRegistration,
);

authRoute.post(
  AUTH_PATHS.OTP_VERIFY,
  validate(verifyOtpSchema),
  authController.verifyOtp,
);

authRoute.post(
  AUTH_PATHS.OTP_RESEND,
  validate(resendOtpSchema),
  authController.resendOtp,
);

authRoute.post(AUTH_PATHS.LOGIN, validate(loginSchema), authController.login);

authRoute.post(
  AUTH_PATHS.COMPLETE_REGISTER,
  validate(registerSchema),
  authController.completeRegistration,
);

authRoute.post(
  AUTH_PATHS.FORGOT_PASSWORD,
  validate(forgotPasswordSchema),
  authController.requestPasswordReset,
);
authRoute.post(
  AUTH_PATHS.RESET_PASSWORD,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
authRoute.post(
  AUTH_PATHS.GOOGLE_LOGIN,
  validate(googleLoginSchema),
  authController.googleLogin,
);

authRoute.post(AUTH_PATHS.REFRESH_TOKEN, authController.refreshAccessToken);

authRoute.post(AUTH_PATHS.LOGOUT, authController.logout);

export default authRoute;
