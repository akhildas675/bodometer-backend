import { z } from "zod";

const formDataArray = z
  .union([
    z.array(z.string()),
    z.string().transform((val) => [val]),
  ])
  .default([]);

export const addWorkoutSchema = z.object({
  body: z.object({
    workoutName: z.string().min(1, "Workout name is required"),
    workoutDescription: z.string().min(1, "Description is required"),
    targetMuscles: formDataArray,
    equipment: formDataArray,
    benefits: formDataArray,
  }),
});

export const updateWorkoutSchema = z.object({
  body: z.object({
    workoutName: z.string().min(1).optional(),
    workoutDescription: z.string().min(1).optional(),
    targetMuscles: formDataArray,
    equipment: formDataArray,
    benefits: formDataArray,
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



export const addSubscriptionSchema = z.object({
  body: z.object({
    data: z.object({
      subscriptionName: z.string().min(1, "Plan name is required."),
      description: z.string().min(1, "Plan description is required."),
      price: z.number().positive("Price must be a valid positive number."),
      durationDays: z.number().min(1, "Duration must be at least 1 day."),
      features: z.array(z.string()).min(1, "At least one feature is required."),
      liveSessionCount: z.number().min(0, "Live session count must be valid"),
      planType: z.enum(["basic", "pro", "elite"]),
    }),
  }),
});



export const updateSubscriptionSchema = z.object({
  body: z.object({
    data: z.object({
      subscriptionName: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      price: z.number().positive().optional(),
      durationDays: z.number().min(1).optional(),
      features: z.array(z.string()).min(1).optional(),
      liveSessionCount: z.number().min(0).optional(),
      planType: z.enum(["basic", "pro", "elite"]).optional(),
    }),
  }),
});