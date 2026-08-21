import { FEATURE_TYPES } from "../constants/subscription.constant";
import { z } from "zod";


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
        durationInDays: z.number().min(1, "Duration in days must be at least 1"),
        isPopular: z.boolean().optional(),
        isActive: z.boolean().optional(),
        features: z.array(z.object({
            featureId: z.string().min(1, "Feature ID is required"),
            limit: z.number().optional().nullable(),
            limitType: z.string().optional().nullable(),
        })).optional(),
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
        durationInDays: z.number().min(1, "Duration in days must be at least 1").optional(),
        isPopular: z.boolean().optional(),
        isActive: z.boolean().optional(),
        features: z.array(z.object({
            featureId: z.string().min(1, "Feature ID is required"),
            limit: z.number().optional().nullable(),
            limitType: z.string().optional().nullable(),
        })).optional(),
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
