import { z } from "zod";

export const coachingValidationSchema = z.object({
  body: z.object({
    serviceType: z.string().min(1, "Service type is required").max(100, "Service type must not exceed 100 characters"),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
    durationMinutes: z.number().min(1, "Duration is required").max(480, "Duration must not exceed 8 hours"),
    price: z.number().min(0, "Price must be a positive number").max(10000, "Price seems unrealistic"),
    bookingMode: z.string().min(1, "Booking mode is required").max(50, "Booking mode must not exceed 50 characters"),
    isActive: z.boolean().optional(),
  }),
});

export const coachingUpdateSchema = z.object({
  body: z.object({
    serviceType: z.string().min(1, "Service type is required").max(100, "Service type must not exceed 100 characters").optional(),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
    durationMinutes: z.number().min(1, "Duration is required").max(480, "Duration must not exceed 8 hours").optional(),
    price: z.number().min(0, "Price must be a positive number").max(10000, "Price seems unrealistic").optional(),
    bookingMode: z.string().max(50, "Booking mode must not exceed 50 characters").optional(),
    isActive: z.boolean().optional(),
  }),
});

export const coachingIdParamSchema = z.object({
  params: z.object({
    serviceId: z.string().min(1, "Service ID is required"),
  }),
});