import { inject, injectable } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { USER_TYPES } from "@/modules/user/user.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { COACHING_TYPES } from "@/modules/coaching/coaching.types";

import { ITrainerAvailabilityRepository } from "../interface/repository.interface/trainer.availability-repository.interface";
import { ITrainerBookingSettingsRepository } from "../interface/repository.interface/trainer-booking.setting-repository.interface";
import { ITrainerUnavailabilityRepository } from "../interface/repository.interface/trainer-unavailability-repository.interface";
import { ITrainerAvailabilityOverrideRepository } from "../interface/repository.interface/trainer-availability-override-repository.interface";
import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";
import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { ICoachingRepository } from "@/modules/coaching/interface/coaching-repository.interface";

import {
  AvailableDateOverview,
  AvailableSlot,
  GetAvailableDatesParams,
  GetAvailableSlotsParams,
  IBookingSlotEngineService,
} from "../interface/service.interface/booking-slot-engine-service.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { BOOKING_STATUS } from "@/constants/constant.values.ts/booking.constant";
import { validateTrainerEligibility } from "../validation/trainer-scheduling-setup.validation";

function format12Hour(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const strHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${strHours}:${strMinutes} ${ampm}`;
}

function toYYYYMMDD(dateInput: Date | string): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    const isoPart = dateInput.split("T")[0];
    const parts = isoPart.split("-");
    if (parts.length === 3) {
      const y = parts[0];
      const m = parts[1].padStart(2, "0");
      const d = parts[2].padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const d = new Date(dateInput);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

import { IBookingRescheduleRequestRepository } from "../repositories/booking-reschedule-request.repository";

@injectable()
export class BookingSlotEngineService implements IBookingSlotEngineService {
  constructor(
    @inject(BOOKING_TYPES.TrainerAvailabilityRepository)
    private _availabilityRepository: ITrainerAvailabilityRepository,

    @inject(BOOKING_TYPES.TrainerBookingSettingsRepository)
    private _bookingSettingsRepository: ITrainerBookingSettingsRepository,

    @inject(BOOKING_TYPES.TrainerUnavailabilityRepository)
    private _unavailabilityRepository: ITrainerUnavailabilityRepository,

    @inject(BOOKING_TYPES.TrainerAvailabilityOverrideRepository)
    private _overrideRepository: ITrainerAvailabilityOverrideRepository,

    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(BOOKING_TYPES.BookingRescheduleRequestRepository)
    private _rescheduleRepository: IBookingRescheduleRequestRepository,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,

    @inject(COACHING_TYPES.CoachingRepository)
    private _coachingRepository: ICoachingRepository,
  ) {}

  async calculateAvailableSlots(
    params: GetAvailableSlotsParams,
  ): Promise<AvailableSlot[]> {
    const { trainerId, serviceId } = params;

    // Resolve trainerId 
    let actualUserId = trainerId;
    const userDoc = await this._userRepository.findById(trainerId);
    if (!userDoc) {
      const profileDoc = await this._trainerProfileRepository.findById(trainerId);
      if (profileDoc && profileDoc.userId) {
        actualUserId = profileDoc.userId.toString();
      } else {
        throw new AppError(STATUS.NOT_FOUND, "Trainer not found.");
      }
    }

    
    const targetDateStr = toYYYYMMDD(params.date);
    const [year, month, day] = targetDateStr.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    // eligibility check
    await validateTrainerEligibility(
      actualUserId,
      this._userRepository,
      this._trainerProfileRepository,
    );

    //  Coaching Service
    const coachingService =
      await this._coachingRepository.getCoachingServiceById(serviceId);
    if (!coachingService || !coachingService.isActive) {
      throw new AppError(STATUS.NOT_FOUND, "Coaching service not found or inactive.");
    }

    // Validate Booking Settings Offered Services
    const settings =
      await this._bookingSettingsRepository.getByTrainerId(actualUserId);
    if (!settings) {
      return [];
    }

    if (settings.serviceIds && settings.serviceIds.length > 0) {
      const isOffered = settings.serviceIds.includes(serviceId);
      if (!isOffered) {
        return [];
      }
    }

    // Find Trainer Availability
    const availability =
      await this._availabilityRepository.getByTrainerId(actualUserId);
    if (!availability || availability.status !== "ACTIVE") {
      return [];
    }

    const effFromStr = toYYYYMMDD(availability.effectiveFrom);
    const effUntilStr = toYYYYMMDD(availability.effectiveUntil);

    if (targetDateStr < effFromStr || targetDateStr > effUntilStr) {
      return [];
    }

    //  Precedence Step: Check Unavailability/Leave
    const unavailabilities =
      await this._unavailabilityRepository.getByTrainerId(actualUserId);

    const isLeave = unavailabilities.some((leave) => {
      if (leave.status !== "ACTIVE") return false;
      const leaveStartStr = toYYYYMMDD(leave.startDate);
      const leaveEndStr = toYYYYMMDD(leave.endDate);
      return targetDateStr >= leaveStartStr && targetDateStr <= leaveEndStr;
    });

    if (isLeave) {
      return []; 
    }

    // Check Active Day Override
    const overrides =
      await this._overrideRepository.getByTrainerId(actualUserId);

    const dayOverride = overrides.find((o) => {
      if (o.status !== "ACTIVE") return false;
      return toYYYYMMDD(o.date) === targetDateStr;
    });

    let shiftsToUse: { startMinute: number; endMinute: number }[] = [];

    if (dayOverride && dayOverride.shifts.length > 0) {
      shiftsToUse = dayOverride.shifts;
    } else {
      // Use Weekly Schedule
      const dayNames = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const targetDayName = dayNames[targetDate.getDay()];

      const daySchedule = availability.weeklySchedule.find(
        (ds) =>
          String(ds.dayOfWeek).toUpperCase() === targetDayName &&
          ds.isAvailable,
      );

      if (!daySchedule || !daySchedule.shifts || daySchedule.shifts.length === 0) {
        return [];
      }

      shiftsToUse = daySchedule.shifts.map((s) => ({
        startMinute: s.startMinute,
        endMinute: s.endMinute,
      }));
    }

    //  Duration, Buffer, Advance Notice, Max Bookings
    const durationMinutes = Number(coachingService.durationMinutes) || 60;
    const bufferMinutes = Number(settings.bufferMinutes) || 15;
    const advanceNoticeHours = Number(settings.advanceNoticeHours) || 2;
    const maxBookingsPerDay = Number(settings.maximumBookingPerDay) || 8;

    const now = new Date();
    const minAdvanceTime = new Date(now.getTime() + advanceNoticeHours * 3600 * 1000);

    //  Generate Candidate Slots
    const candidateSlots: AvailableSlot[] = [];

    for (const shift of shiftsToUse) {
      let currentStartMin = shift.startMinute;

      while (currentStartMin + durationMinutes <= shift.endMinute) {
        const currentEndMin = currentStartMin + durationMinutes;
        const currentBufferEndMin = currentEndMin + bufferMinutes;

        const slotStartTime = new Date(targetDate);
        slotStartTime.setHours(
          Math.floor(currentStartMin / 60),
          currentStartMin % 60,
          0,
          0,
        );

        const slotEndTime = new Date(targetDate);
        slotEndTime.setHours(
          Math.floor(currentEndMin / 60),
          currentEndMin % 60,
          0,
          0,
        );

        const slotBufferEndTime = new Date(targetDate);
        slotBufferEndTime.setHours(
          Math.floor(currentBufferEndMin / 60),
          currentBufferEndMin % 60,
          0,
          0,
        );

        if (slotStartTime >= minAdvanceTime) {
          candidateSlots.push({
            startTime: slotStartTime.toISOString(),
            endTime: slotEndTime.toISOString(),
            bufferEndTime: slotBufferEndTime.toISOString(),
            formattedTime: `${format12Hour(slotStartTime)} - ${format12Hour(slotEndTime)}`,
            startMinute: currentStartMin,
            endMinute: currentEndMin,
          });
        }

        currentStartMin = currentBufferEndMin;
      }
    }

    // Existing Non Cancelled Bookings for Trainer & Remove Conflicts
    const existingBookings =
      await this._bookingRepository.findByTrainerAndDate(actualUserId, targetDate);

    // fetch active pending reschedule proposals for trainer
    const pendingReschedules =
      await this._rescheduleRepository.findPendingByTrainerId(actualUserId);

    const availableSlots = candidateSlots.filter((slot) => {
      const slotStart = new Date(slot.startTime).getTime();
      const slotBufferEnd = new Date(slot.bufferEndTime).getTime();

      // Conflict with active non-cancelled bookings
      const hasBookingConflict = existingBookings.some((b) => {
        if (b.status === BOOKING_STATUS.CANCELLED || b.status === BOOKING_STATUS.NO_SHOW) {
          return false;
        }

        if (b.status === BOOKING_STATUS.PENDING_PAYMENT) {
          const createdAt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const pendingHoldMs = 15 * 60 * 1000;
          if (Date.now() - createdAt > pendingHoldMs) {
            return false;
          }
        }

        const bStart = new Date(b.startTime).getTime();
        const bBufferEnd = new Date(b.bufferEndTime).getTime();

        return slotStart < bBufferEnd && slotBufferEnd > bStart;
      });

      if (hasBookingConflict) return false;

      // conflict with pending reschedule proposed times
      const hasRescheduleConflict = pendingReschedules.some((r) => {
        if (r.status !== "PENDING") return false;
        const pStart = new Date(r.proposedStartTime).getTime();
        const pBufferEnd = new Date(r.proposedBufferEndTime || r.proposedEndTime).getTime();

        return slotStart < pBufferEnd && slotBufferEnd > pStart;
      });

      return !hasRescheduleConflict;
    });

    // Enforce Daily Max Capacity Limit
    const activeBookingCount = existingBookings.filter(
      (b) => b.status !== "CANCELLED",
    ).length;

    const remainingCapacity = maxBookingsPerDay - activeBookingCount;
    if (remainingCapacity <= 0) {
      return [];
    }

    return availableSlots.slice(0, remainingCapacity);
  }

  async calculateAvailableDatesOverview(
    params: GetAvailableDatesParams,
  ): Promise<AvailableDateOverview[]> {
    const { trainerId, serviceId, month } = params;

    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthNum = Number(monthStr);

    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid month format. Expected YYYY-MM.");
    }

    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const result: AvailableDateOverview[] = [];

    let actualUserId = trainerId;
    const userDoc = await this._userRepository.findById(trainerId);
    if (!userDoc) {
      const profileDoc = await this._trainerProfileRepository.findById(trainerId);
      if (profileDoc && profileDoc.userId) {
        actualUserId = profileDoc.userId.toString();
      }
    }

    const unavailabilities =
      await this._unavailabilityRepository.getByTrainerId(actualUserId);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayFormatted = String(day).padStart(2, "0");
      const dateStr = `${yearStr}-${monthStr.padStart(2, "0")}-${dayFormatted}`;

      const isLeave = unavailabilities.some((leave) => {
        if (leave.status !== "ACTIVE") return false;
        const leaveStartStr = toYYYYMMDD(leave.startDate);
        const leaveEndStr = toYYYYMMDD(leave.endDate);
        return dateStr >= leaveStartStr && dateStr <= leaveEndStr;
      });

      if (isLeave) {
        result.push({
          date: dateStr,
          isAvailable: false,
          status: "LEAVE",
          slotCount: 0,
        });
        continue;
      }

      try {
        const slots = await this.calculateAvailableSlots({
          trainerId,
          serviceId,
          date: dateStr,
        });

        if (slots.length > 0) {
          result.push({
            date: dateStr,
            isAvailable: true,
            status: "AVAILABLE",
            slotCount: slots.length,
          });
        } else {
          result.push({
            date: dateStr,
            isAvailable: false,
            status: "OFF",
            slotCount: 0,
          });
        }
      } catch {
        result.push({
          date: dateStr,
          isAvailable: false,
          status: "OFF",
          slotCount: 0,
        });
      }
    }

    return result;
  }
}
