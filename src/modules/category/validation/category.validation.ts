import { z } from "zod";

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
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }
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
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }

        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});

export const categoryIdParamSchema = z.object({
    params: z.object({
        categoryId: z.string().min(1, "Category ID is required"),
    })
});
