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
  body: z.object({
    fitnessGoal: z.string().min(1, "Fitness goal is required").max(50, "Fitness goal must not exceed 50 characters"),
    fitnessLevel: z.string().min(1, "Fitness level is required").max(50, "Fitness level must not exceed 50 characters"),
    workoutDaysPerWeek: z.number().min(1, "Must workout at least 1 day per week").max(7, "Cannot workout more than 7 days per week"),
    preferredWorkoutTime: z.string().max(50, "Preferred workout time must not exceed 50 characters").optional(),
    workoutEnvironment: z.string().max(50, "Workout environment must not exceed 50 characters").optional(),
    equipmentAvailable: z.array(z.string()).max(20, "Cannot have more than 20 equipment items").optional(),
    targetMuscles: z.array(z.string()).max(10, "Cannot target more than 10 muscle groups").optional(),
    workoutDurationMinutes: z.number().min(5, "Workout duration must be at least 5 minutes").max(180, "Workout duration must not exceed 3 hours").optional(),
  }),
});
