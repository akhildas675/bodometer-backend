export const OTP_PURPOSE = {
  USER_REGISTER: "USER_REGISTER",
  TRAINER_REGISTER: "TRAINER_REGISTER",
  FORGET_PASSWORD: "FORGET_PASSWORD",
} as const;

export type OtpPurpose = (typeof OTP_PURPOSE)[keyof typeof OTP_PURPOSE];
