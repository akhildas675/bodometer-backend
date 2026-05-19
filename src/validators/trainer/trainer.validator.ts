import { z } from "zod";
import { GENDER } from "../../constants/identity.constants";



export const createTrainerProfileSchema = z.object({
    body: z.object({
        experienceInYears: z.coerce
            .number()
            .min(0, "Experience must be a positive number")
            .max(50, "Experience seems too high"),
        bio: z
            .string()
            .min(10, "Bio must be at least 10 characters")
            .max(500, "Bio must not exceed 500 characters"),
    }),
    files: z
        .object({
            certificate: z.any().optional(),
        })
        .refine((files) => {
            if (files.certificate) {
                const file = files.certificate;
                const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
                const maxSize = 10 * 1024 * 1024;

                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error("Only PDF, jpeg, and png files are allowed");
                }
                if (file.size > maxSize) {
                    throw new Error("File size must not exceed 10MB");
                }
            }
            return true;
        }, "File validation failed"),
});

export const updateTrainerProfileSchema = z.object({
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
        dateOfBirth: z.coerce.date().nullable().optional(),
    }),
});


export const uploadProfilePictureSchema = z.object({
    files: z
        .object({
            file: z.any().optional(),
        })
        .refine((files) => {
            if (files.file) {
                const file = files.file;
                const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
                const maxSize = 5 * 1024 * 1024;

                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error("Only jpeg, png, and webp images are allowed");
                }
                if (file.size > maxSize) {
                    throw new Error("File size must not exceed 5MB");
                }
            }
            return true;
        }, "File validation failed"),
});
