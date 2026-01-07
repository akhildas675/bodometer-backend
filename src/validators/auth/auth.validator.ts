import { z } from "zod";
import { ROLES } from "../../constants/identity.constants";
import { OTP_PURPOSE } from "../../constants/otp.constants";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be at most 50 characters"),

    email: z
      .string()
      .email("Invalid email address")
      .max(100, "Email is too long"),

    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must be at most 15 digits"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(100, "Password is too long"),
      role: z.enum([ROLES.USER, ROLES.TRAINER]),
  }),
});

export type RegisterUserInput = z.infer<typeof registerSchema>["body"];



export const loginSchema=z.object({
  body:z.object({
    email:z
    .string()
    .email("Invalid Email address")
    .max(100,"Email too long"),

    password:z
    .string()
    .min(6,"Password must be at least 6 character")
    .max(50,"Password is too long"),
  }),
});

export const otpSchema=z.object({
  body:z.object({
    email:z
    .string()
    .email("Invalid Email address")
    .max(100,"Email too long"),
    purpose: z.enum([
      OTP_PURPOSE.USER_REGISTER,
      OTP_PURPOSE.TRAINER_REGISTER,
      OTP_PURPOSE.FORGET_PASSWORD,
    ]),
  })
})