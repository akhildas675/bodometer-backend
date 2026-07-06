import { GENDER } from "@/constants/identity.constants";
import { OTP_PURPOSE } from "@/constants/otp.constants";
import { ROLES } from "@/constants/roles";
import { z } from "zod";


export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .optional(),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number must not exceed 15 digits")
      .nullable()
      .optional(),
    gender: z.nativeEnum(GENDER, { message: "Invalid gender" }).optional(),
    dateOfBirth: z.coerce.date().optional(),
  }),
});

export const uploadProfilePictureSchema = z.object({
  file: z
    .object({
      mimetype: z.string().refine(
        (val) => ["image/jpeg", "image/png", "image/webp"].includes(val),
        { message: "Only jpeg, png, and webp images are allowed" }
      ),
      size: z
        .number()
        .max(5 * 1024 * 1024, "File size must not exceed 5MB"),
    })
    .refine((file) => file !== undefined, { message: "File is required" }),
});


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

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid Email address").max(100, "Email too long"),

    password: z
      .string()
      .min(6, "Password must be at least 6 character")
      .max(50, "Password is too long"),
  }),
});

export const resendOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid Email address").max(100, "Email too long"),
    purpose: z.enum([
      OTP_PURPOSE.USER_REGISTER,
      OTP_PURPOSE.TRAINER_REGISTER,
      OTP_PURPOSE.FORGET_PASSWORD,
    ]),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid Email address").max(100, "Email too long"),
    otp: z.string().min(1, "OTP is required"),
    purpose: z.enum([
      OTP_PURPOSE.USER_REGISTER,
      OTP_PURPOSE.TRAINER_REGISTER,
      OTP_PURPOSE.FORGET_PASSWORD,
    ]),
  }),
});


export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    purpose: z.nativeEnum(OTP_PURPOSE, { message: "Invalid OTP purpose" }),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, "Google ID token is required"),
  }),
});