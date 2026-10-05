import { z } from "zod";

export const createEquipmentSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Equipment title is required").max(100, "Title must not exceed 100 characters"),
        description: z.string().min(1, "Equipment description is required").max(500, "Description must not exceed 500 characters"),
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
        limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
        search: z.string().max(100, "Search term too long").optional(),
    }),
});

export const updateEquipmentSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Equipment ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Equipment title is required").max(100, "Title must not exceed 100 characters").optional(),
        description: z.string().min(1, "Equipment description is required").max(500, "Description must not exceed 500 characters").optional(),
    }),
    file: z.object({
        mimetype: z.string().refine(
            (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
            { message: "Only jpeg, png, webp, and gif images are allowed" }

        ),
        size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
    }).optional()
});
