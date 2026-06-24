import { z } from "zod";
import { QUESTION_TYPES, CONDITION_OPERATORS, DATA_SOURCES } from "../../constants/question.constant";
import { ROLES } from "@/constants/roles";
import { BODY_REGION, DIFFICULTY_LEVEL} from "@/constants/fitness.constant";


export const groupValidationSchema = z.object({
    body: z.object({
        key: z.string().optional(),
        title: z.string().min(1, "Group title is required"),
        order: z.coerce.number().min(0, "Group order must be a non-negative number"),
    })
});

export const groupUpdateSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Group title is required").optional(),
        order: z.coerce.number().min(0, "Group order must be a non-negative number").optional(),
    })
});

export const groupIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Group ID is required"),
    })
});

export const questionValidationSchema = z.object({
    body: z.object({
        key: z.string().optional(),
        question: z.string().min(1, "Question text is required"),
        groupId: z.string().min(1, "Group ID is required"),
        order: z.coerce.number().min(1, "Order must be at least 1"),
        type: z.enum([...QUESTION_TYPES] as [typeof QUESTION_TYPES[number], ...typeof QUESTION_TYPES[number][]], { message: "Invalid question type" }),
        dataSource: z.enum(DATA_SOURCES).optional().nullable(),
        validation: z.object({
            required: z.boolean().optional(),
        }).optional(),
        next: z.array(z.object({
            condition: z.object({
                operator: z.enum(CONDITION_OPERATORS, { message: "Invalid condition operator" }),
                value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
            }),
            nextQuestionId: z.string().min(1, "Next question ID is required"),
        })).optional().nullable(),
        options: z.array(z.object({
            label: z.string().min(1, "Option label is required"),
            value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
        })).optional().nullable(),
        numberConfig: z.object({
            min: z.coerce.number().optional().nullable(),
            max: z.coerce.number().optional().nullable(),
            step: z.coerce.number().optional().nullable(),
            unit: z.string().optional().nullable(),
        }).optional().nullable(),
    })
});

export const questionUpdateSchema = z.object({
    body: z.object({
        key: z.string().optional(),
        question: z.string().min(1, "Question text is required").optional(),
        groupId: z.string().min(1, "Group ID is required").optional(),
        order: z.coerce.number().min(1, "Order must be at least 1").optional(),
        type: z.enum([...QUESTION_TYPES] as [typeof QUESTION_TYPES[number], ...typeof QUESTION_TYPES[number][]], { message: "Invalid question type" }).optional(),
        dataSource: z.enum(DATA_SOURCES).optional().nullable(),
        validation: z.object({
            required: z.boolean().optional(),
        }).optional(),
        next: z.array(z.object({
            condition: z.object({
                operator: z.enum(CONDITION_OPERATORS, { message: "Invalid condition operator" }),
                value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
            }),
            nextQuestionId: z.string().min(1, "Next question ID is required"),
        })).optional().nullable(),
        options: z.array(z.object({
            label: z.string().min(1, "Option label is required"),
            value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
        })).optional().nullable(),
        numberConfig: z.object({
            min: z.coerce.number().optional().nullable(),
            max: z.coerce.number().optional().nullable(),
            step: z.coerce.number().optional().nullable(),
            unit: z.string().optional().nullable(),
        }).optional().nullable(),
    })
});

export const questionIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Question ID is required"),
    })
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



export const getUsersSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
        role: z.enum([ROLES.USER] as [string, ...string[]]).optional(),
        isBlocked: z.coerce.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
});

export const userIdParamSchema = z.object({
    params: z.object({
        userId: z.string().min(1, "User ID is required"),
    }),
});

export const createTargetMuscleSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Target muscle title is required"),
        description: z.string().min(1, "Target muscle description is required"),
        bodyRegion: z.nativeEnum(BODY_REGION),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }

        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
})

export const targetMuscleIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Target muscle ID is required"),
    }),
});

export const getAllTargetMusclesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
        bodyRegion: z.nativeEnum(BODY_REGION).optional(),
    }),
});

export const updateTargetMuscleSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Target muscle ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Target muscle title is required").optional(),
        description: z.string().min(1, "Target muscle description is required").optional(),
        bodyRegion: z.nativeEnum(BODY_REGION).optional(),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }

        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});

export const createEquipmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Equipment title is required"),
        description: z.string().min(1, "Equipment description is required"),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }

        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
})

export const equipmentIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Equipment ID is required"),
    }),
});

export const getAllEquipmentSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
    }),
});

export const updateEquipmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Equipment ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Equipment title is required").optional(),
        description: z.string().min(1, "Equipment description is required").optional(),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }

        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});

// Exercise Validators

const jsonArrayPreprocessor = (val: unknown): unknown => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try { return JSON.parse(val) as unknown; } catch { return [val]; }
    }
    return [];
};


const booleanPreprocessor = (val: unknown) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return Boolean(val);
};

export const createExerciseSchema = z.object({

    body: z.object({
        title: z.string().min(1, "Exercise title is required"),
        description: z.string().min(1, "Exercise description is required"),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL),
        workoutEnvironments: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        isCompound: z.preprocess(booleanPreprocessor, z.boolean()),
        instructions: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        categoryIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        targetMuscleIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        equipmentIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
    }),

    files: z.object({
        image: z.array(z.object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
                { message: "Only jpeg, png, webp, and gif images are allowed" }
            ),
            size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).optional(),
        video: z.array(z.object({
            mimetype: z.string().refine(
                (val) => val.startsWith("video/"),
                { message: "Only video files are allowed" }
            ),
            size: z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).optional(),
    }).optional()
});


export const exerciseIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Exercise ID is required"),
    }),
});

export const updateExerciseSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Exercise ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Exercise title is required").optional(),
        description: z.string().min(1, "Exercise description is required").optional(),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
        workoutEnvironments: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        isCompound: z.preprocess(booleanPreprocessor, z.boolean()).optional(),
        instructions: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        categoryIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        targetMuscleIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        equipmentIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
    }),

    files: z.object({
        image: z.array(z.object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
                { message: "Only jpeg, png, webp, and gif images are allowed" }
            ),
            size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).optional(),
        video: z.array(z.object({
            mimetype: z.string().refine(
                (val) => val.startsWith("video/"),
                { message: "Only video files are allowed" }
            ),
            size: z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).optional(),
    }).optional()
});


export const getAllExercisesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
        targetMuscleId: z.string().optional(),
        categoryId: z.string().optional(),
    }),
});


export const mealCategoryValidationSchema = z.object({
    body:z.object({
        title:z.string().min(1,"Meal Category title is Required"),
        description:z.string().min(1,"Category description is required").max(200,"Maximum 200 characters")
    })
})

export const mealCategoryIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Meal Category ID is required"),
    }),
});

export const updateMealCategorySchema = z.object({
    params: z.object({
        id: z.string().min(1, "Meal Category ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Meal Category title is required").optional(),
        description: z.string().min(1, "Category description is required").max(200, "Maximum 200 characters").optional(),
    }),
});

export const getAllMealCategoriesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        status: z.enum(["active", "blocked", "all"]).optional(),
    }),
});