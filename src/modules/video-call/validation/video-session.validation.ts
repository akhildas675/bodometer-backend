import { z } from "zod";

export const getVideoSessionSchema = z.object({
  params: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
  }),
});

export const requestCallSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
  }),
});

export const acceptCallSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video Session ID is required"),
  }),
});

export const rejectCallSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video Session ID is required"),
  }),
});

export const joinSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video Session ID is required"),
  }),
});

export const leaveSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video Session ID is required"),
  }),
});

export const endSessionSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Video Session ID is required"),
  }),
});
