"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exerciseQuerySchema = exports.bmiCalculationSchema = exports.onboardingAnswerQuestionIdParamSchema = exports.onboardingAnswerUpdateSchema = exports.onboardingAnswersParamSchema = exports.onboardingStatusParamSchema = exports.submitOnboardingSchema = exports.questionIdParamSchema = exports.groupIdParamSchema = exports.verifyPaymentSchema = exports.checkoutSessionSchema = exports.subscriptionIdParamSchema = exports.categoryIdParamSchema = exports.changePasswordSchema = exports.trainerIdParamSchema = exports.uploadProfilePictureSchema = exports.updateUserProfileSchema = void 0;
const zod_1 = require("zod");
const identity_constants_1 = require("../../constants/identity.constants");
const fitness_constant_1 = require("../../constants/fitness.constant");
exports.updateUserProfileSchema = zod_1.z.object({
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
        dateOfBirth: zod_1.z.coerce.date().optional(),
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
        .refine((file) => file !== undefined, { message: "File is required" }),
});
exports.trainerIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Trainer ID is required"),
    })
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, "Old password is required"),
        newPassword: zod_1.z.string().min(1, "New password is required"),
    })
});
exports.categoryIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        categoryId: zod_1.z.string().min(1, "Category ID is required"),
    })
});
exports.subscriptionIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        subscriptionId: zod_1.z.string().min(1, "Subscription ID is required"),
    })
});
exports.checkoutSessionSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string().min(1, "Plan ID is required"),
    })
});
exports.verifyPaymentSchema = zod_1.z.object({
    query: zod_1.z.object({
        session_id: zod_1.z.string().min(1, "Session ID is required"),
    })
});
exports.groupIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        groupId: zod_1.z.string().min(1, "Group ID is required"),
    })
});
exports.questionIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        questionId: zod_1.z.string().min(1, "Question ID is required"),
    })
});
exports.submitOnboardingSchema = zod_1.z.object({
    body: zod_1.z.object({
        answers: zod_1.z.array(zod_1.z.object({
            questionId: zod_1.z.string().min(1, "Question ID is required"),
            key: zod_1.z.string().min(1, "Key is required"),
            value: zod_1.z.union([
                zod_1.z.string(),
                zod_1.z.number(),
                zod_1.z.boolean(),
                zod_1.z.array(zod_1.z.string()),
                zod_1.z.array(zod_1.z.number()),
            ]),
        })),
    }),
});
exports.onboardingStatusParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        onboardingStatusId: zod_1.z.string().min(1, "Onboarding Status ID is required"),
    })
});
exports.onboardingAnswersParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        onboardingAnswersId: zod_1.z.string().min(1, "Onboarding Answers ID is required"),
    })
});
exports.onboardingAnswerUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        answers: zod_1.z.array(zod_1.z.object({
            questionId: zod_1.z.string().min(1, "Question ID is required"),
            answer: zod_1.z.string().min(1, "Answer is required"),
        })),
    })
});
exports.onboardingAnswerQuestionIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        questionId: zod_1.z.string().min(1, "Question ID is required"),
    })
});
exports.bmiCalculationSchema = zod_1.z.object({
    body: zod_1.z.object({
        height: zod_1.z.preprocess((val) => (val === "" || val === null ? undefined : val), zod_1.z.coerce.number().positive().optional()),
        weight: zod_1.z.preprocess((val) => (val === "" || val === null ? undefined : val), zod_1.z.coerce.number().positive().optional()),
        unit: zod_1.z.enum(["metric", "imperial"]),
        heightFt: zod_1.z.preprocess((val) => (val === "" || val === null ? undefined : val), zod_1.z.coerce.number().nonnegative().optional()),
        heightIn: zod_1.z.preprocess((val) => (val === "" || val === null ? undefined : val), zod_1.z.coerce.number().nonnegative().optional()),
    })
});
exports.exerciseQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.preprocess((val) => (val === "" || val === null ? undefined : val), zod_1.z.coerce.number().min(1).optional()),
        limit: zod_1.z.preprocess((val) => (val === "" || val === null ? undefined : val), zod_1.z.coerce.number().min(1).optional()),
        search: zod_1.z.string().optional(),
        difficulty: zod_1.z.nativeEnum(fitness_constant_1.DIFFICULTY_LEVEL).optional(),
        targetMuscleId: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    })
});
