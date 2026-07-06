import { GENDER } from "@/constants/identity.constants";
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
        .refine((files) => {
            const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
            const maxSize = 10 * 1024 * 1024;

            const profileImage = files.profileImage as Express.Multer.File | Express.Multer.File[] | undefined;
            if (profileImage) {
                const file = Array.isArray(profileImage) ? profileImage[0] : profileImage;
                if (file) {
                    if (!allowedTypes.includes(file.mimetype)) {
                        throw new Error("Only PDF, jpeg, and png files are allowed for profile image");
                    }
                    if (file.size > maxSize) {
                        throw new Error("Profile image size must not exceed 10MB");
                    }
                }
            }

            const certificate = files.certificate as Express.Multer.File | Express.Multer.File[] | undefined;
            if (certificate) {
                const file = Array.isArray(certificate) ? certificate[0] : certificate;
                if (file) {
                    if (!allowedTypes.includes(file.mimetype)) {
                        throw new Error("Only PDF, jpeg, and png files are allowed for certificate");
                    }
                    if (file.size > maxSize) {
                        throw new Error("Certificate file size must not exceed 10MB");
                    }
                }
            }

            const coverImage = files.coverImage as Express.Multer.File | Express.Multer.File[] | undefined;
            if (coverImage) {
                const file = Array.isArray(coverImage) ? coverImage[0] : coverImage;
                if (file) {
                    if (!allowedTypes.includes(file.mimetype)) {
                        throw new Error("Only PDF, jpeg, and png files are allowed for cover image");
                    }
                    if (file.size > maxSize) {
                        throw new Error("Cover image size must not exceed 10MB");
                    }
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
        specializations: z.array(z.string()).optional(),
        profilePic: z.string().optional(),
        coverPhoto: z.string().optional(),
        certifications: z.array(z.string()).optional(),
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
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
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
            .min(5, "Rejection reason must be at least 5 characters"),
    }),
});

export const getTrainerAppointmentsSchema = z.object({
    query: z.object({
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        status: z.string().optional(),
    }),
});
