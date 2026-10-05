import { FEATURE_TYPES } from "../constants/subscription.constant";
import { z } from "zod";


export const featureValidationSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Feature title is required").max(100, "Title must not exceed 100 characters"),
        description: z.string().min(1, "Feature description is required").max(500, "Description must not exceed 500 characters"),
        type: z.enum(FEATURE_TYPES, { message: "Invalid feature type" }),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const featureUpdateSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Feature title is required").max(100, "Title must not exceed 100 characters").optional(),
        description: z.string().min(1, "Feature description is required").max(500, "Description must not exceed 500 characters").optional(),
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
        name: z.string().min(1, "Subscription plan name is required").max(100, "Name must not exceed 100 characters"),
        description: z.string().min(1, "Subscription plan description is required").max(500, "Description must not exceed 500 characters"),
        price: z.number().min(1, "Subscription plan price is required").max(10000, "Price seems unrealistic"),
        durationInDays: z.number().min(1, "Duration in days must be at least 1").max(3650, "Duration must not exceed 10 years"),
        isPopular: z.boolean().optional(),
        isActive: z.boolean().optional(),
        features: z.array(z.object({
            featureId: z.string().min(1, "Feature ID is required"),
            limit: z.number().optional().nullable(),
            limitType: z.string().max(50, "Limit type must not exceed 50 characters").optional().nullable(),
        })).max(50, "Cannot have more than 50 features").optional(),
        isBlocked: z.boolean().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    })
});

export const subscriptionPlanUpdateSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Subscription plan name is required").max(100, "Name must not exceed 100 characters").optional(),
        description: z.string().min(1, "Subscription plan description is required").max(500, "Description must not exceed 500 characters").optional(),
        price: z.number().min(1, "Subscription plan price is required").max(10000, "Price seems unrealistic").optional(),
        durationInDays: z.number().min(1, "Duration in days must be at least 1").max(3650, "Duration must not exceed 10 years").optional(),
        isPopular: z.boolean().optional(),
        isActive: z.boolean().optional(),
        features: z.array(z.object({
            featureId: z.string().min(1, "Feature ID is required"),
            limit: z.number().optional().nullable(),
            limitType: z.string().max(50, "Limit type must not exceed 50 characters").optional().nullable(),
        })).max(50, "Cannot have more than 50 features").optional(),
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

export const subscriptionIdParamSchema = z.object({
  params: z.object({
    subscriptionId: z.string().min(1, "Subscription ID is required"),
  })
});

export const checkoutSessionSchema = z.object({
  body: z.object({
    subscriptionPlanId: z.string().min(1, "Plan ID is required"),
  })
});

export const verifyPaymentSchema = z.object({
  query: z.object({
    session_id: z.string().min(1, "Session ID is required"),
  })
});

export const upgradePreviewParamSchema = z.object({
  params: z.object({
    targetPlanId: z.string().min(1, "Target Plan ID is required"),
  }),
});

export const upgradeCheckoutSchema = z.object({
  body: z.object({
    targetPlanId: z.string().min(1, "Target Plan ID is required"),
  }),
});
