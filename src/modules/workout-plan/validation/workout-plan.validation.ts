import { z } from "zod";
import { WORKOUT_EXERCISE_STATUS } from "@/constants/constant.values.ts/fitness.constant";

export const markDayCompletedSchema = z.object({
  body: z.object({
    dayNumber: z.number().min(1, "Day number must be at least 1").max(365, "Day number seems unrealistic"),
    completed: z.boolean(),
  }),
});

export const markExerciseStatusSchema = z.object({
  body: z.object({
    dayNumber: z.number().min(1, "Day number must be at least 1").max(365, "Day number seems unrealistic"),
    instanceId: z.string().min(1, "Instance ID is required"),
    status: z.nativeEnum(WORKOUT_EXERCISE_STATUS),
    timeTakenSeconds: z.number().min(0, "Time taken must be non-negative").max(36000, "Time taken seems unrealistic (max 10 hours)").optional(),
  }),
});

export const workoutPlanIdParamSchema = z.object({
  params: z.object({
    planId: z.string().min(1, "Workout plan ID is required"),
  }),
});

export const generateWorkoutPlanSchema = z.object({
  body: z.object({}).optional(),
});
