import { z } from "zod";

export const mealCategoryValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Meal Category title is Required").max(100, "Title must not exceed 100 characters"),
    description: z.string().min(1, "Category description is required").max(200, "Maximum 200 characters")
  })
});

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
    title: z.string().min(1, "Meal Category title is required").max(100, "Title must not exceed 100 characters").optional(),
    description: z.string().min(1, "Category description is required").max(200, "Maximum 200 characters").optional(),
  }),
});

export const getAllMealCategoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
    search: z.string().max(100, "Search term too long").optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.enum(["active", "blocked", "all"]).optional(),
  }),
});
