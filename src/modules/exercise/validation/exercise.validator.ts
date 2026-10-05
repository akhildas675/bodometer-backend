import { z } from "zod";
import { DIFFICULTY_LEVEL } from "@/constants/constant.values.ts/fitness.constant";

const jsonArrayPreprocessor = (val: unknown): unknown => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try { return JSON.parse(val) as unknown; } catch { return [val]; }
    }
    return [];
};


const booleanPreprocessor = (val: unknown) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return Boolean(val);
};

export const createExerciseSchema = z.object({

    body: z.object({
        title: z.string().min(1, "Exercise title is required").max(100, "Title must not exceed 100 characters"),
        description: z.string().min(1, "Exercise description is required").max(1000, "Description must not exceed 1000 characters"),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL),
        workoutEnvironments: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 workout environments")),
        isCompound: z.preprocess(booleanPreprocessor, z.boolean()),
        instructions: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(20, "Cannot have more than 20 instructions")),
        categoryIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 categories")),
        targetMuscleIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 target muscles")),
        equipmentIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 equipment items")),
    }),

    files: z.object({
        image: z.array(z.object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
                { message: "Only jpeg, png, webp, and gif images are allowed" }
            ),
            size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).max(5, "Cannot upload more than 5 images").optional(),
        video: z.array(z.object({
            mimetype: z.string().refine(
                (val) => val.startsWith("video/"),
                { message: "Only video files are allowed" }
            ),
            size: z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).max(1, "Cannot upload more than 1 video").optional(),
    }).optional()
});


export const exerciseIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Exercise ID is required"),
    }),
});

export const updateExerciseSchema = z.object({
    params: z.object({
        id: z.string().min(1, "Exercise ID is required"),
    }),
    body: z.object({
        title: z.string().min(1, "Exercise title is required").max(100, "Title must not exceed 100 characters").optional(),
        description: z.string().min(1, "Exercise description is required").max(1000, "Description must not exceed 1000 characters").optional(),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
        workoutEnvironments: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 workout environments")).optional(),
        isCompound: z.preprocess(booleanPreprocessor, z.boolean()).optional(),
        instructions: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(20, "Cannot have more than 20 instructions")).optional(),
        categoryIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 categories")).optional(),
        targetMuscleIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 target muscles")).optional(),
        equipmentIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string()).max(10, "Cannot select more than 10 equipment items")).optional(),
    }),

    files: z.object({
        image: z.array(z.object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
                { message: "Only jpeg, png, webp, and gif images are allowed" }
            ),
            size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).max(5, "Cannot upload more than 5 images").optional(),
        video: z.array(z.object({
            mimetype: z.string().refine(
                (val) => val.startsWith("video/"),
                { message: "Only video files are allowed" }
            ),
            size: z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).max(1, "Cannot upload more than 1 video").optional(),
    }).optional()
});


export const getAllExercisesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
        search: z.string().max(100, "Search term too long").optional(),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
        targetMuscleId: z.string().optional(),
        categoryId: z.string().optional(),
    }),
});
