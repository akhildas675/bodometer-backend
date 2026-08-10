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
      timeZone: z.string().min(1, "Timezone is required"),
      weeklySchedule: z.array(weeklyScheduleSchema),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    }),
    settings: z.object({
      serviceIds: z.array(z.string()),
      advanceNoticeHours: z.number().min(0),
      bufferMinutes: z.number().min(0),
      maximumBookingPerDay: z.number().min(1),
    }),
    unavailabilities: z
      .array(
        z.object({
          type: unavailabilityTypeEnum,
          startDate: z.union([z.string(), z.date()]),
          endDate: z.union([z.string(), z.date()]),
          reason: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

export const updateAvailabilitySchema = z.object({
  body: z.object({
    effectiveFrom: z.union([z.string(), z.date()]),
    effectiveUntil: z.union([z.string(), z.date()]),
    timeZone: z.string().min(1, "Timezone is required"),
    weeklySchedule: z.array(weeklyScheduleSchema),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const updateBookingSettingsSchema = z.object({
  body: z.object({
    serviceIds: z.array(z.string()).optional(),
    advanceNoticeHours: z.number().min(0).optional(),
    bufferMinutes: z.number().min(0).optional(),
    maximumBookingPerDay: z.number().min(1).optional(),
  }),
});

export const createUnavailabilitySchema = z.object({
  body: z.object({
    type: unavailabilityTypeEnum,
    startDate: z.union([z.string(), z.date()]),
    endDate: z.union([z.string(), z.date()]),
    reason: z.string().optional(),
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
    reason: z.string().optional(),
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
    shifts: z.array(shiftSchema),
    reason: z.string().optional(),
  }),
});

export const updateOverrideSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Override ID is required"),
  }),
  body: z.object({
    date: z.union([z.string(), z.date()]).optional(),
    shifts: z.array(shiftSchema).optional(),
    reason: z.string().optional(),
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
    reason: z.string().optional(),
  }),
});

export const respondRescheduleSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "requestId is required"),
  }),
  body: z.object({
    accept: z.boolean(),
    reason: z.string().optional(),
  }),
});

export const withdrawRescheduleSchema = z.object({
  params: z.object({
    requestId: z.string().min(1, "requestId is required"),
  }),
  body: z
    .object({
      reason: z.string().optional(),
    })
    .optional(),
});
