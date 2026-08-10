import { ADVANCE_NOTICE_HOURS, BUFFER_TIME_MINUTES, MAX_BOOKING_LIMITS } from "@/constants/constant.values.ts/booking.constant";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import mongoose from "mongoose";
import { SetupBookingSettingsDto } from "../dto/trainer-scheduling.dto";

export function validateServiceIds(
  serviceIds: string[],
): void {

  if (
    !Array.isArray(serviceIds) ||
    serviceIds.length === 0
  ) {
    throw new AppError(
      STATUS.BAD_REQUEST,
      MESSAGES.COACHING.ONE_COACHING_SERVICE_REQUIRED,
    );
  }

  for (const serviceId of serviceIds) {

    if (
      !mongoose.Types.ObjectId.isValid(serviceId)
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
       MESSAGES.COACHING.INVALID_SERVICE_IDS
      );
    }
  }
}


export function validateDuplicateServiceIds(
  serviceIds: string[],
): void {

  const uniqueIds =
    new Set(serviceIds);

  if (
    uniqueIds.size !== serviceIds.length
  ) {
    throw new AppError(
      STATUS.BAD_REQUEST,
      MESSAGES.COACHING.DUPLICATE_SERVICE_IDS
    );
  }
}

export function validateAdvanceNoticeHours(
  advanceNoticeHours: number,
): void {

  const allowedValues =
    Object.values(
      ADVANCE_NOTICE_HOURS,
    ) as number[];

  if (
    !allowedValues.includes(
      advanceNoticeHours,
    )
  ) {
    throw new AppError(
      STATUS.BAD_REQUEST,
      "Invalid advance notice hours",
    );
  }
}


export function validateBufferMinutes(
  bufferMinutes: number,
): void {

  const allowedValues =
    Object.values(
      BUFFER_TIME_MINUTES,
    ) as number[];

  if (
    !allowedValues.includes(
      bufferMinutes,
    )
  ) {
    throw new AppError(
      STATUS.BAD_REQUEST,
      "Invalid booking buffer time",
    );
  }
}

export function validateMaximumBookingPerDay(
  maximumBookingPerDay: number,
): void {

  const allowedValues =
    Object.values(
      MAX_BOOKING_LIMITS,
    ) as number[];

  if (
    !allowedValues.includes(
      maximumBookingPerDay,
    )
  ) {
    throw new AppError(
      STATUS.BAD_REQUEST,
      "Invalid maximum bookings per day",
    );
  }
}

export function validateTrainerBookingSettings(
  settings: SetupBookingSettingsDto,
): void {

  validateServiceIds(
    settings.serviceIds,
  );

  validateDuplicateServiceIds(
    settings.serviceIds,
  );

  validateAdvanceNoticeHours(
    settings.advanceNoticeHours,
  );

  validateBufferMinutes(
    settings.bufferMinutes,
  );

  validateMaximumBookingPerDay(
    settings.maximumBookingPerDay,
  );
}