import { z } from "zod";

const videoSessionIdSchema = z.object({
  videoSessionId: z.string().min(1, "Video session ID is required."),
});

const bookingIdSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required."),
});

export const requestVideoCallSchema = z.object({
  params: bookingIdSchema,
});

export const acceptVideoCallSchema = z.object({
  params: videoSessionIdSchema,
});

export const rejectVideoCallSchema = z.object({
  params: videoSessionIdSchema,
});

export const joinVideoSessionSchema = z.object({
  params: videoSessionIdSchema,
});

export const leaveVideoSessionSchema = z.object({
  params: videoSessionIdSchema,
});

export const getVideoSessionSchema = z.object({
  params: videoSessionIdSchema,
});

export const endVideoSessionSchema = z.object({
  params: videoSessionIdSchema,
});