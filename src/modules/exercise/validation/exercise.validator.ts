import { z } from "zod";
import { DIFFICULTY_LEVEL } from "@/constants/fitness.constant";

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
        title: z.string().min(1, "Exercise title is required"),
        description: z.string().min(1, "Exercise description is required"),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL),
        workoutEnvironments: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        isCompound: z.preprocess(booleanPreprocessor, z.boolean()),
        instructions: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        categoryIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        targetMuscleIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
        equipmentIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())),
    }),

    files: z.object({
        image: z.array(z.object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
                { message: "Only jpeg, png, webp, and gif images are allowed" }
            ),
            size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).optional(),
        video: z.array(z.object({
            mimetype: z.string().refine(
                (val) => val.startsWith("video/"),
                { message: "Only video files are allowed" }
            ),
            size: z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).optional(),
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
        title: z.string().min(1, "Exercise title is required").optional(),
        description: z.string().min(1, "Exercise description is required").optional(),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
        workoutEnvironments: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        isCompound: z.preprocess(booleanPreprocessor, z.boolean()).optional(),
        instructions: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        categoryIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        targetMuscleIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
        equipmentIds: z.preprocess(jsonArrayPreprocessor, z.array(z.string())).optional(),
    }),

    files: z.object({
        image: z.array(z.object({
            mimetype: z.string().refine(
                (val) => ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(val),
                { message: "Only jpeg, png, webp, and gif images are allowed" }
            ),
            size: z.number().max(5 * 1024 * 1024, "Image size must not exceed 5MB"),
        })).optional(),
        video: z.array(z.object({
            mimetype: z.string().refine(
                (val) => val.startsWith("video/"),
                { message: "Only video files are allowed" }
            ),
            size: z.number().max(50 * 1024 * 1024, "Video size must not exceed 50MB"),
        })).optional(),
    }).optional()
});


export const getAllExercisesSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).optional(),
        search: z.string().optional(),
        difficulty: z.nativeEnum(DIFFICULTY_LEVEL).optional(),
        targetMuscleId: z.string().optional(),
        categoryId: z.string().optional(),
    }),
});
