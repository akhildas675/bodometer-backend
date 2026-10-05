import { z } from "zod";

export const generateDietPlanSchema = z.object({
  body: z.object({
    fitnessGoal: z.string().min(1, "Fitness goal is required").max(50, "Fitness goal must not exceed 50 characters"),
    targetCalories: z.number().min(500, "Target calories must be at least 500").max(10000, "Target calories seem unrealistic").optional(),
    targetProtein: z.number().min(0, "Target protein must be non-negative").max(500, "Target protein seems unrealistic").optional(),
    targetCarbs: z.number().min(0, "Target carbs must be non-negative").max(1000, "Target carbs seem unrealistic").optional(),
    targetFats: z.number().min(0, "Target fats must be non-negative").max(500, "Target fats seem unrealistic").optional(),
    dietaryRestrictions: z.array(z.string()).max(10, "Cannot have more than 10 dietary restrictions").optional(),
    allergies: z.array(z.string()).max(10, "Cannot have more than 10 allergies").optional(),
  }),
});

export const dietPlanIdParamSchema = z.object({
  params: z.object({
    planId: z.string().min(1, "Diet plan ID is required"),
  }),
});
