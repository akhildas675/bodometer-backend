import { Router } from "express";
import {
  loginSchema,
  otpSchema,
  registerSchema,
} from "../../validators/auth/auth.validator";
import { validate } from "../../middleware/validate";
import { createAuthModule } from "../../modules/auth/auth.module";
import { AUTH_ROUTES } from "../../constants/routes.constant/auth-routes.constant";

const authRoute = Router();
const { authController } = createAuthModule();

authRoute.post(
  AUTH_ROUTES.REGISTER,
  validate(registerSchema),
  authController.register,
);

authRoute.post(
  AUTH_ROUTES.OTP_VERIFY,
  validate(otpSchema),
  authController.verifyOtp,
);

authRoute.post(
  AUTH_ROUTES.OTP_RESEND,
  validate(otpSchema),
  authController.resendOtp,
);

authRoute.post(
  AUTH_ROUTES.LOGIN,
  validate(loginSchema),
  authController.login,
);

authRoute.post(
  AUTH_ROUTES.COMPLETE_REGISTER,
  validate(registerSchema),
  authController.completeRegister,
);

authRoute.post(
  AUTH_ROUTES.FORGOT_PASSWORD,
  authController.forgotPassword,
);

authRoute.post(
  AUTH_ROUTES.RESET_PASSWORD,
  authController.resetPassword,
);

authRoute.post(
  AUTH_ROUTES.GOOGLE_LOGIN,
  authController.googleLogin,
);

authRoute.post(
  AUTH_ROUTES.REFRESH_TOKEN,
  authController.refreshToken,
);

authRoute.post(
  AUTH_ROUTES.LOGOUT,
  authController.logout,
);

export default authRoute;