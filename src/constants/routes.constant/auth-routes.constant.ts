export const AUTH_ROUTES = {
  BASE: '/auth',
  REGISTER: '/auth/register',
  OTP_VERIFY: '/auth/otp-verify',
  OTP_RESEND: '/auth/otp-resend',
  LOGIN: '/auth/login',
  COMPLETE_REGISTER: '/auth/register/complete',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  GOOGLE_LOGIN: '/auth/google-login',
  REFRESH_TOKEN: '/auth/refresh-token',
  LOGOUT: '/auth/logout',
} as const;