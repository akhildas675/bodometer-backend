import { z } from "zod";
import { QUESTION_TYPES, CONDITION_OPERATORS, DATA_SOURCES } from "../../constants/question.constant";
import { ROLES } from "@/constants/roles";
import { FEATURE_TYPES } from "../../constants/subscription.constant";

export const categoryValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required"),
        description: z.string().min(1, "Category description is required"),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp"].includes(val),
            { message: "Only jpeg, png, and webp images are allowed" }
        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }, { message: "Category image is required" })
});

export const categoryUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required").optional(),
        description: z.string().min(1, "Category description is required").optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp"].includes(val),
            { message: "Only jpeg, png, and webp images are allowed" }
        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});

export const categoryIdParamSchema = z.object({
    params: z.object({
        categoryId: z.string().min(1, "Category ID is required"),
    })
});

export const featureValidationSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Feature title is required"),
        description: z.string().min(1, "Feature description is required"),
        type: z.enum(FEATURE_TYPES, { message: "Invalid feature type" }),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const featureUpdateSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Feature title is required").optional(),
        description: z.string().min(1, "Feature description is required").optional(),
        type: z.enum(FEATURE_TYPES, { message: "Invalid feature type" }).optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const featureIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Feature ID is required"),
    })
});

export const subscriptionPlanValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Subscription plan name is required"),
        description: z.string().min(1, "Subscription plan description is required"),
        price: z.number().min(1, "Subscription plan price is required"),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const subscriptionPlanUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Subscription plan name is required").optional(),
        description: z.string().min(1, "Subscription plan description is required").optional(),
        price: z.number().min(1, "Subscription plan price is required").optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const subscriptionPlanIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Subscription plan ID is required"),
    })
});

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
        type: z.enum(QUESTION_TYPES, { message: "Invalid question type" }),
        dataSource: z.enum(DATA_SOURCES).optional().nullable(),
        validation: z.object({
            required: z.boolean().optional(),
        }).optional(),
        next: z.array(z.object({
            condition: z.object({
                operator: z.enum(CONDITION_OPERATORS, { message: "Invalid condition operator" }),
                value: z.any().optional(),
            }),
            nextQuestionId: z.string().min(1, "Next question ID is required"),
        })).optional().nullable(),
        options: z.array(z.object({
            label: z.string().min(1, "Option label is required"),
            value: z.any().optional(),
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
        type: z.enum(QUESTION_TYPES, { message: "Invalid question type" }).optional(),
        dataSource: z.enum(DATA_SOURCES).optional().nullable(),
        validation: z.object({
            required: z.boolean().optional(),
        }).optional(),
        next: z.array(z.object({
            condition: z.object({
                operator: z.enum(CONDITION_OPERATORS, { message: "Invalid condition operator" }),
                value: z.any().optional(),
            }),
            nextQuestionId: z.string().min(1, "Next question ID is required"),
        })).optional().nullable(),
        options: z.array(z.object({
            label: z.string().min(1, "Option label is required"),
            value: z.any().optional(),
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