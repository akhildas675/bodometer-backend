import { z } from "zod";

const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

const shiftSchema = z.object({
  startMinute: z.number().min(0).max(1440),
  endMinute: z.number().min(0).max(1440),
});

const weeklyScheduleSchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  isAvailable: z.boolean(),
  shifts: z.array(shiftSchema),
});

const unavailabilityTypeEnum = z.enum([
  "VACATION",
  "MEDICAL_LEAVE",
  "EMERGENCY",
  "PERSONAL_LEAVE",
]);

export const createSetupSchema = z.object({
  body: z.object({
    availability: z.object({
      effectiveFrom: z.union([z.string(), z.date()]),
      effectiveUntil: z.union([z.string(), z.date()]),
      timeZone: z.string().min(1, "Timezone is required").max(50, "Timezone must not exceed 50 characters"),
      weeklySchedule: z.array(weeklyScheduleSchema).min(1, "At least one day must be scheduled").max(7, "Cannot schedule more than 7 days"),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    }),
    settings: z.object({
      serviceIds: z.array(z.string()).min(1, "At least one service is required").max(50, "Cannot select more than 50 services"),
      advanceNoticeHours: z.number().min(0).max(72, "Advance notice must not exceed 72 hours"),
      bufferMinutes: z.number().min(20).max(60),
      maximumBookingPerDay: z.number().min(1).max(20, "Maximum bookings per day seems unrealistic"),
    }),
    unavailabilities: z
      .array(
        z.object({
          type: unavailabilityTypeEnum,
          startDate: z.union([z.string(), z.date()]),
          endDate: z.union([z.string(), z.date()]),
          reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
        }),
      )
      .max(50, "Cannot have more than 50 unavailabilities").optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    effectiveFrom: z.union([z.string(), z.date()]),
    effectiveUntil: z.union([z.string(), z.date()]),
    timeZone: z.string().min(1, "Timezone is required").max(50, "Timezone must not exceed 50 characters"),
    weeklySchedule: z.array(weeklyScheduleSchema).min(1, "At least one day must be scheduled").max(7, "Cannot schedule more than 7 days"),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const updateBookingSettingsSchema = z.object({
  body: z.object({
    serviceIds: z.array(z.string()).min(1, "At least one service is required").max(50, "Cannot select more than 50 services").optional(),
    advanceNoticeHours: z.number().min(0).max(72, "Advance notice must not exceed 72 hours").optional(),
    bufferMinutes: z.number().min(20).max(60).optional(),
    maximumBookingPerDay: z.number().min(1).max(20, "Maximum bookings per day seems unrealistic").optional(),
  }),
});

export const createUnavailabilitySchema = z.object({
  body: z.object({
    type: unavailabilityTypeEnum,
    startDate: z.union([z.string(), z.date()]),
    endDate: z.union([z.string(), z.date()]),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  }),
});

export const updateUnavailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Unavailability ID is required"),
  }),
  body: z.object({
    type: unavailabilityTypeEnum.optional(),
    startDate: z.union([z.string(), z.date()]).optional(),
    endDate: z.union([z.string(), z.date()]).optional(),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  }),
});

export const deleteUnavailabilitySchema = z.object({
  params: z.object({
    id: z.string().min(1, "Unavailability ID is required"),
  }),
});

export const createOverrideSchema = z.object({
  body: z.object({
    date: z.union([z.string(), z.date()]),
    shifts: z.array(shiftSchema).min(1, "At least one shift is required").max(10, "Cannot have more than 10 shifts"),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  }),
});

export const updateOverrideSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Override ID is required"),
  }),
  body: z.object({
    date: z.union([z.string(), z.date()]).optional(),
    shifts: z.array(shiftSchema).min(1, "At least one shift is required").max(10, "Cannot have more than 10 shifts").optional(),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
    status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
  }),
});

export const deleteOverrideSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Override ID is required"),
  }),
});

export const getSlotsSchema = z.object({
  query: z.object({
    trainerId: z.string().min(1, "trainerId parameter is required"),
    serviceId: z.string().min(1, "serviceId parameter is required"),
    date: z.string().min(1, "date parameter is required"),
  }),
});

export const getAvailableDatesSchema = z.object({
  query: z.object({
    trainerId: z.string().min(1, "trainerId parameter is required"),
    serviceId: z.string().min(1, "serviceId parameter is required"),
    month: z.string().min(1, "month parameter is required"),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    trainerId: z.string().min(1, "trainerId is required"),
    serviceId: z.string().min(1, "serviceId is required"),
    bookingDate: z.string().min(1, "bookingDate is required"),
    startTime: z.string().min(1, "startTime is required"),
    endTime: z.string().min(1, "endTime is required"),
    bufferEndTime: z.string().min(1, "bufferEndTime is required"),
    paymentMethod: z.enum(["WALLET", "ONLINE", "SPLIT"]).optional(),
  }),
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "bookingId is required"),
    sessionId: z.string().min(1, "sessionId is required"),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().min(1, "booking ID is required"),
  }),
  body: z
    .object({
      reason: z.string().optional(),
      reasonCode: z.string().optional(),
    })
    .optional(),
});

export const proposeRescheduleSchema = z.object({
  params: z.object({
    id: z.string().min(1, "booking ID is required"),
  }),
  body: z.object({
    proposedStartTime: z.string().min(1, "proposedStartTime is required"),
    proposedEndTime: z.string().min(1, "proposedEndTime is required"),
    proposedBufferEndTime: z
      .string()
      .min(1, "proposedBufferEndTime is required"),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  }),
});

export const respondRescheduleSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "requestId is required"),
  }),
  body: z.object({
    accept: z.boolean(),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  }),
});

export const withdrawRescheduleSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "requestId is required"),
  }),
  body: z
    .object({
      reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
    })
    .optional(),
});
