import { z } from "zod";
import { GENDER } from "@/constants/identity.constants";


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