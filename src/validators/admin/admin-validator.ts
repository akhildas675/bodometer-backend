import { z } from "zod";

export const addWorkoutSchema = z.object({
  body: z.object({
    workoutName: z.string().min(1, "Workout name is required"),
    workoutDescription: z.string().min(1, "Workout description is required"),
  }),
});

export const getWorkoutsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});