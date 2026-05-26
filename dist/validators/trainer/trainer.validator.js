"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTrainerDocumentSchema = exports.uploadProfilePictureSchema = exports.updateTrainerProfileSchema = exports.createTrainerProfileSchema = void 0;
const zod_1 = require("zod");
const identity_constants_1 = require("../../constants/identity.constants");
exports.createTrainerProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        experience: zod_1.z.coerce
            .number()
            .min(0, "Experience must be a positive number")
            .max(50, "Experience seems too high"),
        bio: zod_1.z
            .string()
            .min(10, "Bio must be at least 10 characters")
            .max(500, "Bio must not exceed 500 characters"),
        gender: zod_1.z.nativeEnum(identity_constants_1.GENDER, { message: "Invalid gender" }).optional(),
        dateOfBirth: zod_1.z.preprocess((val) => {
            if (val === "" || val === undefined || val === null)
                return null;
            return val;
        }, zod_1.z.coerce.date().nullable()).optional(),
        specializationIds: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())]).optional(),
    }),
    files: zod_1.z
        .object({
        profileImage: zod_1.z.unknown().optional(),
        certificate: zod_1.z.unknown().optional(),
        coverImage: zod_1.z.unknown().optional(),
    })
        .refine((files) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        const maxSize = 10 * 1024 * 1024;
        if (files.profileImage) {
            const file = Array.isArray(files.profileImage) ? files.profileImage[0] : files.profileImage;
            if (file) {
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error("Only PDF, jpeg, and png files are allowed for profile image");
                }
                if (file.size > maxSize) {
                    throw new Error("Profile image size must not exceed 10MB");
                }
            }
        }
        if (files.certificate) {
            const file = Array.isArray(files.certificate) ? files.certificate[0] : files.certificate;
            if (file) {
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new Error("Only PDF, jpeg, and png files are allowed for certificate");
                }
                if (file.size > maxSize) {
                    throw new Error("Certificate file size must not exceed 10MB");
                }
            }
        }
        if (files.coverImage) {
            const file = Array.isArray(files.coverImage) ? files.coverImage[0] : files.coverImage;
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
exports.updateTrainerProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").optional(),
        userName: zod_1.z
            .string()
            .min(3, "Username must be at least 3 characters")
            .optional(),
        phoneNumber: zod_1.z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(15, "Phone number must not exceed 15 digits")
            .nullable()
            .optional(),
        gender: zod_1.z.nativeEnum(identity_constants_1.GENDER, { message: "Invalid gender" }).optional(),
        dateOfBirth: zod_1.z.preprocess((val) => {
            if (val === "" || val === undefined || val === null)
                return null;
            return val;
        }, zod_1.z.coerce.date().nullable()).optional(),
        experienceInYears: zod_1.z.coerce
            .number()
            .min(0, "Experience must be a positive number")
            .max(50, "Experience seems too high")
            .optional(),
        bio: zod_1.z
            .string()
            .min(10, "Bio must be at least 10 characters")
            .max(500, "Bio must not exceed 500 characters")
            .optional(),
        specializations: zod_1.z.array(zod_1.z.string()).optional(),
        profilePic: zod_1.z.string().optional(),
        coverPhoto: zod_1.z.string().optional(),
        certifications: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.uploadProfilePictureSchema = zod_1.z.object({
    file: zod_1.z
        .object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp"].includes(val), { message: "Only jpeg, png, and webp images are allowed" }),
        size: zod_1.z
            .number()
            .max(5 * 1024 * 1024, "File size must not exceed 5MB"),
    })
        .optional(),
});
exports.uploadTrainerDocumentSchema = zod_1.z.object({
    file: zod_1.z
        .object({
        mimetype: zod_1.z.string().refine((val) => [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ].includes(val), { message: "Only PDF, Word documents, and JPEG/PNG/WebP images are allowed" }),
        size: zod_1.z
            .number()
            .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
    })
        .optional(),
});
