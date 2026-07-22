import { z } from "zod";

export const coachingValidationSchema = z.object({
  body: z.object({
    serviceType: z.string().min(1, "Service type is required"),
    description: z.string().optional(),
    durationMinutes: z.number().min(1, "Duration is required"),
    price: z.number().min(0, "Price must be a positive number"),
    bookingMode: z.string().min(1, "Booking mode is required"),
    isActive: z.boolean().optional(),
  }),
});

export const coachingUpdateSchema = z.object({
  body: z.object({
    serviceType: z.string().min(1, "Service type is required").optional(),
    description: z.string().optional(),
    durationMinutes: z.number().min(1, "Duration is required").optional(),
    price: z.number().min(0, "Price must be a positive number").optional(),
    bookingMode: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const coachingIdParamSchema = z.object({
  params: z.object({
    serviceId: z.string().min(1, "Service ID is required"),
  }),
});