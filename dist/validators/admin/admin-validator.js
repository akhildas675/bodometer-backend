"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllExercisesSchema = exports.updateExerciseSchema = exports.exerciseIdParamSchema = exports.createExerciseSchema = exports.updateEquipmentSchema = exports.getAllEquipmentSchema = exports.equipmentIdParamSchema = exports.createEquipmentSchema = exports.updateTargetMuscleSchema = exports.getAllTargetMusclesSchema = exports.targetMuscleIdParamSchema = exports.createTargetMuscleSchema = exports.userIdParamSchema = exports.getUsersSchema = exports.getTrainerAppointmentsSchema = exports.rejectTrainerSchema = exports.profileIdParamSchema = exports.trainerIdParamSchema = exports.getTrainersSchema = exports.questionIdParamSchema = exports.questionUpdateSchema = exports.questionValidationSchema = exports.groupIdParamSchema = exports.groupUpdateSchema = exports.groupValidationSchema = exports.subscriptionPlanIdParamSchema = exports.subscriptionPlanUpdateSchema = exports.subscriptionPlanValidationSchema = exports.featureIdParamSchema = exports.featureUpdateSchema = exports.featureValidationSchema = exports.categoryIdParamSchema = exports.categoryUpdateSchema = exports.categoryValidationSchema = void 0;
const zod_1 = require("zod");
const question_constant_1 = require("../../constants/question.constant");
const roles_1 = require("../../constants/roles");
const subscription_constant_1 = require("../../constants/subscription.constant");
const fitness_constant_1 = require("../../constants/fitness.constant");
exports.categoryValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Category name is required"),
        description: zod_1.z.string().min(1, "Category description is required"),
        isBlocked: zod_1.z.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
    file: zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
        size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }, { message: "Category image is required" })
});
exports.categoryUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Category name is required").optional(),
        description: zod_1.z.string().min(1, "Category description is required").optional(),
        isBlocked: zod_1.z.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
    file: zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
        size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});
exports.categoryIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        categoryId: zod_1.z.string().min(1, "Category ID is required"),
    })
});
exports.featureValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Feature title is required"),
        description: zod_1.z.string().min(1, "Feature description is required"),
        type: zod_1.z.enum(subscription_constant_1.FEATURE_TYPES, { message: "Invalid feature type" }),
        isBlocked: zod_1.z.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    })
});
exports.featureUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Feature title is required").optional(),
        description: zod_1.z.string().min(1, "Feature description is required").optional(),
        type: zod_1.z.enum(subscription_constant_1.FEATURE_TYPES, { message: "Invalid feature type" }).optional(),
        isBlocked: zod_1.z.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    })
});
exports.featureIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Feature ID is required"),
    })
});
exports.subscriptionPlanValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Subscription plan name is required"),
        description: zod_1.z.string().min(1, "Subscription plan description is required"),
        price: zod_1.z.number().min(1, "Subscription plan price is required"),
        durationInDays: zod_1.z.number().min(1, "Duration in days must be at least 1"),
        isPopular: zod_1.z.boolean().optional(),
        isActive: zod_1.z.boolean().optional(),
        features: zod_1.z.array(zod_1.z.object({
            featureId: zod_1.z.string().min(1, "Feature ID is required"),
            limit: zod_1.z.number().optional().nullable(),
            limitType: zod_1.z.string().optional().nullable(),
        })).optional(),
        isBlocked: zod_1.z.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    })
});
exports.subscriptionPlanUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Subscription plan name is required").optional(),
        description: zod_1.z.string().min(1, "Subscription plan description is required").optional(),
        price: zod_1.z.number().min(1, "Subscription plan price is required").optional(),
        durationInDays: zod_1.z.number().min(1, "Duration in days must be at least 1").optional(),
        isPopular: zod_1.z.boolean().optional(),
        isActive: zod_1.z.boolean().optional(),
        features: zod_1.z.array(zod_1.z.object({
            featureId: zod_1.z.string().min(1, "Feature ID is required"),
            limit: zod_1.z.number().optional().nullable(),
            limitType: zod_1.z.string().optional().nullable(),
        })).optional(),
        isBlocked: zod_1.z.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    })
});
exports.subscriptionPlanIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Subscription plan ID is required"),
    })
});
exports.groupValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        key: zod_1.z.string().optional(),
        title: zod_1.z.string().min(1, "Group title is required"),
        order: zod_1.z.coerce.number().min(0, "Group order must be a non-negative number"),
    })
});
exports.groupUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Group title is required").optional(),
        order: zod_1.z.coerce.number().min(0, "Group order must be a non-negative number").optional(),
    })
});
exports.groupIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Group ID is required"),
    })
});
exports.questionValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        key: zod_1.z.string().optional(),
        question: zod_1.z.string().min(1, "Question text is required"),
        groupId: zod_1.z.string().min(1, "Group ID is required"),
        order: zod_1.z.coerce.number().min(1, "Order must be at least 1"),
        type: zod_1.z.enum([...question_constant_1.QUESTION_TYPES], { message: "Invalid question type" }),
        dataSource: zod_1.z.enum(question_constant_1.DATA_SOURCES).optional().nullable(),
        validation: zod_1.z.object({
            required: zod_1.z.boolean().optional(),
        }).optional(),
        next: zod_1.z.array(zod_1.z.object({
            condition: zod_1.z.object({
                operator: zod_1.z.enum(question_constant_1.CONDITION_OPERATORS, { message: "Invalid condition operator" }),
                value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())]).optional(),
            }),
            nextQuestionId: zod_1.z.string().min(1, "Next question ID is required"),
        })).optional().nullable(),
        options: zod_1.z.array(zod_1.z.object({
            label: zod_1.z.string().min(1, "Option label is required"),
            value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())]).optional(),
        })).optional().nullable(),
        numberConfig: zod_1.z.object({
            min: zod_1.z.coerce.number().optional().nullable(),
            max: zod_1.z.coerce.number().optional().nullable(),
            step: zod_1.z.coerce.number().optional().nullable(),
            unit: zod_1.z.string().optional().nullable(),
        }).optional().nullable(),
    })
});
exports.questionUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        key: zod_1.z.string().optional(),
        question: zod_1.z.string().min(1, "Question text is required").optional(),
        groupId: zod_1.z.string().min(1, "Group ID is required").optional(),
        order: zod_1.z.coerce.number().min(1, "Order must be at least 1").optional(),
        type: zod_1.z.enum([...question_constant_1.QUESTION_TYPES], { message: "Invalid question type" }).optional(),
        dataSource: zod_1.z.enum(question_constant_1.DATA_SOURCES).optional().nullable(),
        validation: zod_1.z.object({
            required: zod_1.z.boolean().optional(),
        }).optional(),
        next: zod_1.z.array(zod_1.z.object({
            condition: zod_1.z.object({
                operator: zod_1.z.enum(question_constant_1.CONDITION_OPERATORS, { message: "Invalid condition operator" }),
                value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())]).optional(),
            }),
            nextQuestionId: zod_1.z.string().min(1, "Next question ID is required"),
        })).optional().nullable(),
        options: zod_1.z.array(zod_1.z.object({
            label: zod_1.z.string().min(1, "Option label is required"),
            value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.array(zod_1.z.string())]).optional(),
        })).optional().nullable(),
        numberConfig: zod_1.z.object({
            min: zod_1.z.coerce.number().optional().nullable(),
            max: zod_1.z.coerce.number().optional().nullable(),
            step: zod_1.z.coerce.number().optional().nullable(),
            unit: zod_1.z.string().optional().nullable(),
        }).optional().nullable(),
    })
});
exports.questionIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Question ID is required"),
    })
});
exports.getTrainersSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).optional(),
        limit: zod_1.z.coerce.number().min(1).optional(),
        search: zod_1.z.string().optional(),
        isBlocked: zod_1.z.coerce.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
exports.trainerIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        trainerId: zod_1.z.string().min(1, "Trainer ID is required"),
    }),
});
exports.profileIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        profileId: zod_1.z.string().min(1, "Profile ID is required"),
    }),
});
exports.rejectTrainerSchema = zod_1.z.object({
    params: zod_1.z.object({
        profileId: zod_1.z.string().min(1, "Profile ID is required"),
    }),
    body: zod_1.z.object({
        reason: zod_1.z
            .string()
            .min(5, "Rejection reason must be at least 5 characters"),
    }),
});
exports.getTrainerAppointmentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
        page: zod_1.z.coerce.number().min(1).optional(),
        limit: zod_1.z.coerce.number().min(1).optional(),
        status: zod_1.z.string().optional(),
    }),
});
exports.getUsersSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).optional(),
        limit: zod_1.z.coerce.number().min(1).optional(),
        search: zod_1.z.string().optional(),
        role: zod_1.z.enum([roles_1.ROLES.USER]).optional(),
        isBlocked: zod_1.z.coerce.boolean().optional(),
        sortBy: zod_1.z.string().optional(),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    }),
});
exports.userIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().min(1, "User ID is required"),
    }),
});
exports.createTargetMuscleSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Target muscle title is required"),
        description: zod_1.z.string().min(1, "Target muscle description is required"),
        bodyRegion: zod_1.z.nativeEnum(fitness_constant_1.BODY_REGION),
    }),
    file: zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
        size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});
exports.targetMuscleIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Target muscle ID is required"),
    }),
});
exports.getAllTargetMusclesSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).optional(),
        limit: zod_1.z.coerce.number().min(1).optional(),
        search: zod_1.z.string().optional(),
        bodyRegion: zod_1.z.nativeEnum(fitness_constant_1.BODY_REGION).optional(),
    }),
});
exports.updateTargetMuscleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Target muscle ID is required"),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Target muscle title is required").optional(),
        description: zod_1.z.string().min(1, "Target muscle description is required").optional(),
        bodyRegion: zod_1.z.nativeEnum(fitness_constant_1.BODY_REGION).optional(),
    }),
    file: zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
        size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});
exports.createEquipmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Equipment title is required"),
        description: zod_1.z.string().min(1, "Equipment description is required"),
    }),
    file: zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
        size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});
exports.equipmentIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Equipment ID is required"),
    }),
});
exports.getAllEquipmentSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).optional(),
        limit: zod_1.z.coerce.number().min(1).optional(),
        search: zod_1.z.string().optional(),
    }),
});
exports.updateEquipmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Equipment ID is required"),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Equipment title is required").optional(),
        description: zod_1.z.string().min(1, "Equipment description is required").optional(),
    }),
    file: zod_1.z.object({
        mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
        size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});
// Exercise Validators
const jsonArrayPreprocessor = (val) => {
    if (!val)
        return [];
    if (Array.isArray(val))
        return val;
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        }
        catch {
            return [val];
        }
    }
    return [];
};
const booleanPreprocessor = (val) => {
    if (val === 'true')
        return true;
    if (val === 'false')
        return false;
    return Boolean(val);
};
exports.createExerciseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Exercise title is required"),
        description: zod_1.z.string().min(1, "Exercise description is required"),
        difficulty: zod_1.z.nativeEnum(fitness_constant_1.DIFFICULTY_LEVEL),
        workoutEnvironments: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())),
        isCompound: zod_1.z.preprocess(booleanPreprocessor, zod_1.z.boolean()),
        instructions: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())),
        categoryIds: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())),
        targetMuscleIds: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())),
        equipmentIds: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())),
    }),
    files: zod_1.z.object({
        image: zod_1.z.array(zod_1.z.object({
            mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
            size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).optional(),
        video: zod_1.z.array(zod_1.z.object({
            mimetype: zod_1.z.string().refine((val) => val.startsWith("video/"), { message: "Only video files are allowed" }),
            size: zod_1.z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).optional(),
    }).optional()
});
exports.exerciseIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Exercise ID is required"),
    }),
});
exports.updateExerciseSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().min(1, "Exercise ID is required"),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, "Exercise title is required").optional(),
        description: zod_1.z.string().min(1, "Exercise description is required").optional(),
        difficulty: zod_1.z.nativeEnum(fitness_constant_1.DIFFICULTY_LEVEL).optional(),
        workoutEnvironments: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())).optional(),
        isCompound: zod_1.z.preprocess(booleanPreprocessor, zod_1.z.boolean()).optional(),
        instructions: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())).optional(),
        categoryIds: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())).optional(),
        targetMuscleIds: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())).optional(),
        equipmentIds: zod_1.z.preprocess(jsonArrayPreprocessor, zod_1.z.array(zod_1.z.string())).optional(),
    }),
    files: zod_1.z.object({
        image: zod_1.z.array(zod_1.z.object({
            mimetype: zod_1.z.string().refine((val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val), { message: "Only jpeg, png, webp, and gif images are allowed" }),
            size: zod_1.z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).optional(),
        video: zod_1.z.array(zod_1.z.object({
            mimetype: zod_1.z.string().refine((val) => val.startsWith("video/"), { message: "Only video files are allowed" }),
            size: zod_1.z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).optional(),
    }).optional()
});
exports.getAllExercisesSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).optional(),
        limit: zod_1.z.coerce.number().min(1).optional(),
        search: zod_1.z.string().optional(),
        difficulty: zod_1.z.nativeEnum(fitness_constant_1.DIFFICULTY_LEVEL).optional(),
        targetMuscleId: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().optional(),
    }),
});
