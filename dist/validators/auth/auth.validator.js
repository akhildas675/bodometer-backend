"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLoginSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyOtpSchema = exports.resendOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const otp_constants_1 = require("../../constants/otp.constants");
const roles_1 = require("../../constants/roles");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name must be at most 50 characters"),
        email: zod_1.z
            .string()
            .email("Invalid email address")
            .max(100, "Email is too long"),
        phoneNumber: zod_1.z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(15, "Phone number must be at most 15 digits"),
        password: zod_1.z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password is too long"),
        confirmPassword: zod_1.z
            .string()
            .min(6, "Password must be at least 6 characters")
            .max(100, "Password is too long"),
        role: zod_1.z.enum([roles_1.ROLES.USER, roles_1.ROLES.TRAINER]),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid Email address").max(100, "Email too long"),
        password: zod_1.z
            .string()
            .min(6, "Password must be at least 6 character")
            .max(50, "Password is too long"),
    }),
});
exports.resendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid Email address").max(100, "Email too long"),
        purpose: zod_1.z.enum([
            otp_constants_1.OTP_PURPOSE.USER_REGISTER,
            otp_constants_1.OTP_PURPOSE.TRAINER_REGISTER,
            otp_constants_1.OTP_PURPOSE.FORGET_PASSWORD,
        ]),
    }),
});
exports.verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid Email address").max(100, "Email too long"),
        otp: zod_1.z.string().min(1, "OTP is required"),
        purpose: zod_1.z.enum([
            otp_constants_1.OTP_PURPOSE.USER_REGISTER,
            otp_constants_1.OTP_PURPOSE.TRAINER_REGISTER,
            otp_constants_1.OTP_PURPOSE.FORGET_PASSWORD,
        ]),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        role: zod_1.z.nativeEnum(roles_1.ROLES, { message: "Invalid role" }),
        purpose: zod_1.z.nativeEnum(otp_constants_1.OTP_PURPOSE, { message: "Invalid OTP purpose" }),
        password: zod_1.z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    }),
});
exports.googleLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string().min(1, "Google ID token is required"),
    }),
});
