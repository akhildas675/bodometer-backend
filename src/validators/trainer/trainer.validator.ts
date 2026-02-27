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
    file: z
        .object({
            mimetype: z
                .string()
                .refine(
                    (val) =>
                        ["application/pdf", "image/jpeg", "image/png"].includes(val),
                    { message: "Only PDF, jpeg, and png files are allowed" }
                ),
            size: z.number().max(10 * 1024 * 1024, "File size must not exceed 10MB"),
        })
        .refine((file) => file !== undefined, { message: "Certificate is required" }),
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
    file: z
        .object({
            mimetype: z
                .string()
                .refine(
                    (val) => ["image/jpeg", "image/png", "image/webp"].includes(val),
                    { message: "Only jpeg, png, and webp images are allowed" }
                ),
            size: z.number().max(5 * 1024 * 1024, "File size must not exceed 5MB"),
        })
        .refine((file) => file !== undefined, { message: "File is required" }),
});

export const getWorkoutListSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});
