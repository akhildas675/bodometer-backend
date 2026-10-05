import { z } from "zod";
import { BODY_REGION } from "@/constants/constant.values.ts/fitness.constant";

export const createTargetMuscleSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Target muscle title is required").max(100, "Title must not exceed 100 characters"),
        description: z.string().min(1, "Target muscle description is required").max(500, "Description must not exceed 500 characters"),
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
        limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
        search: z.string().max(100, "Search term too long").optional(),
        bodyRegion: z.nativeEnum(BODY_REGION).optional(),
    }),
});

export const updateTargetMuscleSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Target muscle ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Target muscle title is required").max(100, "Title must not exceed 100 characters").optional(),
        description: z.string().min(1, "Target muscle description is required").max(500, "Description must not exceed 500 characters").optional(),
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
