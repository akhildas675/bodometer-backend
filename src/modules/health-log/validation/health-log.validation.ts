import { z } from "zod";

export const upsertHealthLogSchema = z.object({
  body: z.object({
    date: z.string().min(1, "Date is required"),
    sleepHours: z.number().min(0, "Sleep hours must be non-negative").max(24, "Sleep hours must not exceed 24").optional(),
    waterLiters: z.number().min(0, "Water must be non-negative").max(20, "Water intake seems unrealistic").optional(),
    steps: z.number().min(0, "Steps must be non-negative").max(100000, "Steps count seems unrealistic").optional(),
    meals: z.array(z.object({
      mealCategoryId: z.string().min(1, "Meal category ID is required"),
      description: z.string().min(1, "Description is required").max(500, "Description must not exceed 500 characters"),
      correctedMeal: z.string().max(500, "Corrected meal must not exceed 500 characters").optional(),
      estimatedCalories: z.number().min(0, "Calories must be non-negative").max(10000, "Calories seem unrealistic").optional(),
      estimatedProtein: z.number().min(0, "Protein must be non-negative").max(1000, "Protein seems unrealistic").optional(),
      estimatedCarbs: z.number().min(0, "Carbs must be non-negative").max(1000, "Carbs seem unrealistic").optional(),
      estimatedFat: z.number().min(0, "Fat must be non-negative").max(500, "Fat seems unrealistic").optional(),
    })).max(20, "Cannot log more than 20 meals per day"),
  }),
});

export const healthLogDateParamSchema = z.object({
  params: z.object({
    date: z.string().min(1, "Date is required"),
  }),
});

export const healthLogQuerySchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    timeframe: z.enum(["daily", "weekly", "monthly"]).optional(),
  }),
});
