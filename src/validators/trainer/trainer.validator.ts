import { z } from "zod";
import { GENDER } from "../../constants/identity.constants";



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

export const createAvailabilitySchema = z.object({
    body: z.object({
        startDate: z.string().min(1, "Start date is required"),
        endDate: z.string().min(1, "End date is required"),
        timeWindows: z.array(z.object({
            startTime: z.string().min(1, "Start time is required"),
            endTime: z.string().min(1, "End time is required"),
        })).min(1, "At least one time window is required").max(4, "Maximum 4 time windows allowed"),
        sessionDuration: z.number().min(15, "Minimum session duration is 15 minutes"),
    })
});

export const updateAvailabilitySchema = z.object({
    params: z.object({
        availabilityId: z.string().min(1, "Availability ID is required"),
    }),
    body: z.object({
        isActive: z.boolean({ message: "isActive must be a boolean" }),
    })
});

export const getAvailabilitiesSchema = z.object({
    query: z.object({
        page: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(1).optional()),
        limit: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(1).optional()),
        status: z.string().optional(),
    })
});

export const trainerGetBookingsSchema = z.object({
    query: z.object({
        page: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(1).optional()),
        limit: z.preprocess((val) => (val === "" || val === null ? undefined : val), z.coerce.number().min(1).optional()),
        status: z.string().optional(),
        date: z.string().optional(),
        search: z.string().optional(),
    })
});

export const trainerBookingActionSchema = z.object({
    params: z.object({
        bookingId: z.string().min(1, "Booking ID is required"),
    }),
    body: z.object({
        reason: z.string().min(1, "Reason is required").optional(),
    }).optional()
});
