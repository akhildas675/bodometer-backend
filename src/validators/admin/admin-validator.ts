import { z } from "zod";
import { QUESTION_TYPES } from "../../constants/question.constant";
import { ROLES } from "@/constants/roles";

export const categoryValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required"),
        description: z.string().min(1, "Category description is required"),
        image: z.string().min(1, "Category image is required"),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const categoryUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Category name is required").optional(),
        description: z.string().min(1, "Category description is required").optional(),
        image: z.string().min(1, "Category image is required").optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const categoryIdParamSchema = z.object({
    params: z.object({
        categoryId: z.string().min(1, "Category ID is required"),
    })
});

export const featureValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Feature name is required"),
        description: z.string().min(1, "Feature description is required"),
        image: z.string().min(1, "Feature image is required"),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const featureUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Feature name is required").optional(),
        description: z.string().min(1, "Feature description is required").optional(),
        image: z.string().min(1, "Feature image is required").optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const featureIdParamSchema = z.object({
    params: z.object({
        featureId: z.string().min(1, "Feature ID is required"),
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
        subscriptionPlanId: z.string().min(1, "Subscription plan ID is required"),
    })
});

export const groupValidationSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Group name is required"),
        description: z.string().min(1, "Group description is required"),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const groupUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Group name is required").optional(),
        description: z.string().min(1, "Group description is required").optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const groupIdParamSchema = z.object({
    params: z.object({
        groupId: z.string().min(1, "Group ID is required"),
    })
});

export const questionValidationSchema = z.object({
    body: z.object({
        text: z.string().min(1, "Question text is required"),
        type: z.enum(QUESTION_TYPES),
        options: z.array(z.string()).optional(),
        isRequired: z.boolean().optional(),
    })
});

export const questionUpdateSchema = z.object({
    body: z.object({
        text: z.string().min(1, "Question text is required").optional(),
        type: z.enum(QUESTION_TYPES).optional(),
        options: z.array(z.string()).optional(),
        isRequired: z.boolean().optional(),
    })
});

export const questionIdParamSchema = z.object({
    params: z.object({
        questionId: z.string().min(1, "Question ID is required"),
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