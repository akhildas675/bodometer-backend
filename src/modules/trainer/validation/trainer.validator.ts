import { GENDER } from "@/constants/constant.values.ts/identity.constants";
import { z } from "zod";


export const createTrainerProfileSchema = z.object({
    body: z.object({
        experience: z.coerce
            .number()
            .min(0, "Experience must be a positive number")
            .max(50, "Experience seems too high"),
        bio: z
            .string()
            .min(10, "Bio must be at least 10 characters")
            .max(500, "Bio must not exceed 500 characters"),
        gender: z.nativeEnum(GENDER, { message: "Invalid gender" }).optional(),
        dateOfBirth: z.preprocess((val) => {
            if (val === "" || val === undefined || val === null) return null;
            return val;
        }, z.coerce.date().nullable()).optional(),
        specializationIds: z.union([z.string(), z.array(z.string())]).optional(),
    }),
    files: z
        .object({
            profileImage: z.unknown().optional(),
            certificate: z.unknown().optional(),
            coverImage: z.unknown().optional(),
        })
        .optional()
        .superRefine((files, ctx) => {
            if (!files) return;
            const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
            const allowedDocTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png", "image/webp"];
            const maxSize = 10 * 1024 * 1024;

            const profileImage = files.profileImage as Express.Multer.File | Express.Multer.File[] | undefined;
            if (profileImage) {
                const file = Array.isArray(profileImage) ? profileImage[0] : profileImage;
                if (file) {
                    if (!allowedImageTypes.includes(file.mimetype)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Only JPEG, PNG, and WebP image formats are allowed for profile picture",
                            path: ["profileImage"],
                        });
                    } else if (file.size > maxSize) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Profile image size must not exceed 10MB",
                            path: ["profileImage"],
                        });
                    }
                }
            }

            const certificate = files.certificate as Express.Multer.File | Express.Multer.File[] | undefined;
            if (certificate) {
                const file = Array.isArray(certificate) ? certificate[0] : certificate;
                if (file) {
                    if (!allowedDocTypes.includes(file.mimetype)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Only PDF, JPEG, PNG, and WebP files are allowed for certificate",
                            path: ["certificate"],
                        });
                    } else if (file.size > maxSize) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Certificate file size must not exceed 10MB",
                            path: ["certificate"],
                        });
                    }
                }
            }

            const coverImage = files.coverImage as Express.Multer.File | Express.Multer.File[] | undefined;
            if (coverImage) {
                const file = Array.isArray(coverImage) ? coverImage[0] : coverImage;
                if (file) {
                    if (!allowedImageTypes.includes(file.mimetype)) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Only JPEG, PNG, and WebP image formats are allowed for cover photo",
                            path: ["coverImage"],
                        });
                    } else if (file.size > maxSize) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: "Cover photo size must not exceed 10MB",
                            path: ["coverImage"],
                        });
                    }
                }
            }
        }),
});

export const updateTrainerProfileSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required").max(50, "Name must not exceed 50 characters").optional(),
        userName: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(30, "Username must not exceed 30 characters")
            .optional(),
        phoneNumber: z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(15, "Phone number must not exceed 15 digits")
            .nullable()
            .optional(),
        gender: z.nativeEnum(GENDER, { message: "Invalid gender" }).optional(),
        dateOfBirth: z.preprocess((val) => {
            if (val === "" || val === undefined || val === null) return null;
            return val;
        }, z.coerce.date().nullable()).optional(),
        experienceInYears: z.coerce
            .number()
            .min(0, "Experience must be a positive number")
            .max(50, "Experience seems too high")
            .optional(),
        bio: z
            .string()
            .min(10, "Bio must be at least 10 characters")
            .max(500, "Bio must not exceed 500 characters")
            .optional(),
        specializations: z.array(z.string()).max(20, "Cannot have more than 20 specializations").optional(),
        profilePic: z.string().max(500, "Profile pic URL too long").optional(),
        coverPhoto: z.string().max(500, "Cover photo URL too long").optional(),
        certifications: z.array(z.string()).max(50, "Cannot have more than 50 certifications").optional(),
    }),
});

export const uploadProfilePictureSchema = z.object({
    file: z
        .object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(val),
                { message: "Only JPEG, PNG, and WebP images are allowed" }
            ),
            size: z
                .number()
                .max(5 * 1024 * 1024, "File size must not exceed 5MB"),
        })
        .optional(),
});

export const uploadTrainerDocumentSchema = z.object({
    file: z
        .object({
            mimetype: z.string().refine(
                (val) => [
                    "application/pdf",
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ].includes(val),
                { message: "Only PDF, Word documents, and JPEG/PNG/WebP images are allowed" }
            ),
            size: z
                .number()
                .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
        })
        .optional(),
});

export const getTrainersSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
        search: z.string().max(100, "Search term too long").optional(),
        isBlocked: z.coerce.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});


export const trainerIdParamSchema = z.object({
    params: z.object({
        trainerId: z.string().min(1, "Trainer ID is required"),
    }),
});

export const profileIdParamSchema = z.object({
    params: z.object({
        profileId: z.string().min(1, "Profile ID is required"),
    }),
});

export const rejectTrainerSchema = z.object({
    params: z.object({
        profileId: z.string().min(1, "Profile ID is required"),
    }),
    body: z.object({
        reason: z
            .string()
            .min(5, "Rejection reason must be at least 5 characters")
            .max(500, "Rejection reason must not exceed 500 characters"),
    }),
});

export const getTrainerAppointmentsSchema = z.object({
    query: z.object({
        search: z.string().max(100, "Search term too long").optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
        status: z.string().optional(),
    }),
});
