import { z } from "zod";

export const getTrainersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    search: z.string().optional(),
    isBlocked: z.coerce.boolean().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});


export const trainerIdParamSchema = z.object({
  params: z.object({
    trainerId: z.string().min(1, "Trainer ID is required"),
  }),
});

export const profileIdParamSchema = z.object({
  params: z.object({
    profileId: z.string().min(1, "Profile ID is required"),
  }),
});

export const rejectTrainerSchema = z.object({
  params: z.object({
    profileId: z.string().min(1, "Profile ID is required"),
  }),
  body: z.object({
    reason: z
      .string()
      .min(5, "Rejection reason must be at least 5 characters"),
  }),
});

export const getTrainerAppointmentsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).optional(),
    status: z.string().optional(),
  }),
});