import { inject, injectable } from "inversify";

import { BOOKING_TYPES } from "../booking.types";

import { ITrainerSchedulingService } from "../interface/service.interface/trainer-scheduling-service.interface";

import { ITrainerUnavailabilityRepository } from "../interface/repository.interface/trainer-unavailability-repository.interface";

import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";

import { ICoachingRepository } from "@/modules/coaching/interface/coaching-repository.interface";

import { USER_TYPES } from "@/modules/user/user.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { COACHING_TYPES } from "@/modules/coaching/coaching.types";
import { ITrainerAvailabilityRepository } from "../interface/repository.interface/trainer.availability-repository.interface";
import { ITrainerBookingSettingsRepository } from "../interface/repository.interface/trainer-booking.setting-repository.interface";
import {
  CreateTrainerOverrideDto,
  CreateTrainerSchedulingSetupDto,
  SetupUnavailabilityDto,
  TrainerSchedulingSetupResponseDto,
  UpdateTrainerAvailabilityDto,
  UpdateTrainerBookingSettingsDto,
  UpdateTrainerOverrideDto,
} from "../dto/trainer-scheduling.dto";
import { ITrainerAvailabilityOverrideRepository } from "../interface/repository.interface/trainer-availability-override-repository.interface";
import { TrainerAvailabilityOverride } from "../interface/domain/trainer-availability-override.interface";
import { DayOfWeek, AvailabilityStatus, BOOKING_STATUS } from "@/constants/constant.values.ts/booking.constant";
import { TrainerUnavailability } from "../interface/domain/trainer-unavailability.interface";
import {
  validateInitialSetupDoesNotExist,
  validateTrainerEligibility,
} from "../validation/trainer-scheduling-setup.validation";
import { validateTrainerAvailability } from "../validation/trainer-availability.validation";
import { validateTrainerBookingSettings } from "../validation/trainer-booking-settings.validation";
import { validateSelectedCoachingServices } from "../validation/trainer-scheduling.validation";
import { validateTrainerUnavailabilities } from "../validation/trainer-unavailability.validation";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { TrainerAvailability } from "../interface/domain/trainer-availability.interface";

import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { Booking } from "../interface/domain/booking.interface";

@injectable()
export class TrainerSchedulingService implements ITrainerSchedulingService {
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

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,

    @inject(COACHING_TYPES.CoachingRepository)
    private _coachingRepository: ICoachingRepository,
  ) {}

  async createSetup(
    trainerId: string,
    data: CreateTrainerSchedulingSetupDto,
  ): Promise<void> {
    const { availability, settings, unavailabilities } = data;

    await validateTrainerEligibility(
      trainerId,
      this._userRepository,
      this._trainerProfileRepository,
    );

    await validateInitialSetupDoesNotExist(
      trainerId,
      this._availabilityRepository,
    );

    validateTrainerAvailability(availability);

    validateTrainerBookingSettings(settings);

    await validateSelectedCoachingServices(
      settings.serviceIds,
      this._coachingRepository,
    );

    if (unavailabilities && unavailabilities.length > 0) {
      validateTrainerUnavailabilities(unavailabilities, availability);
    }

    await this._availabilityRepository.createAvailability({
      trainerId,

      effectiveFrom: new Date(availability.effectiveFrom),

      effectiveUntil: new Date(availability.effectiveUntil),

      timeZone: availability.timeZone,

      weeklySchedule: availability.weeklySchedule,

      status: availability.status,
    });

    await this._bookingSettingsRepository.createBookingSettings({
      trainerId,

      serviceIds: settings.serviceIds,

      advanceNoticeHours: settings.advanceNoticeHours,

      bufferMinutes: settings.bufferMinutes,

      maximumBookingPerDay: settings.maximumBookingPerDay,
    });

    if (unavailabilities && unavailabilities.length > 0) {
      await this._unavailabilityRepository.createMany(
        unavailabilities.map((leave) => ({
          trainerId,

          type: leave.type,

          startDate: new Date(leave.startDate),

          endDate: new Date(leave.endDate),

          reason: leave.reason,

          status: "ACTIVE",
        })),
      );
    }
  }

  async getSetup(
    trainerId: string,
  ): Promise<TrainerSchedulingSetupResponseDto> {
    const availability =
      await this._availabilityRepository.getByTrainerId(trainerId);

    const settings =
      await this._bookingSettingsRepository.getByTrainerId(trainerId);

    const unavailabilities =
      await this._unavailabilityRepository.getByTrainerId(trainerId);

    return {
      availability,
      settings,
      unavailabilities,
    };
  }

  async updateAvailability(
    trainerId: string,
    data: UpdateTrainerAvailabilityDto,
  ): Promise<TrainerAvailability> {
    await validateTrainerEligibility(
      trainerId,
      this._userRepository,
      this._trainerProfileRepository,
    );

    const existingAvailability = await this._availabilityRepository.getByTrainerId(trainerId);
    if (!existingAvailability) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.AVAILABILITY.AVAILABILITY_NOT_FOUND);
    }

    const availabilityPayload = {
      effectiveFrom: new Date(data.effectiveFrom),
      effectiveUntil: new Date(data.effectiveUntil),
      timeZone: data.timeZone,
      weeklySchedule: data.weeklySchedule.map((day) => ({
        ...day,
        dayOfWeek: (day.dayOfWeek ? String(day.dayOfWeek).toUpperCase() : day.dayOfWeek) as DayOfWeek,
        shifts: day.isAvailable ? (Array.isArray(day.shifts) ? day.shifts : []) : [],
      })),
      status: (data.status ? String(data.status).toUpperCase() : "ACTIVE") as AvailabilityStatus,
    };

    validateTrainerAvailability(availabilityPayload);

    // ─── Flowchart Conflict Evaluation: Check Proposed Schedule against Future Active Bookings ───
    const allTrainerBookings = await this._bookingRepository.findByTrainerId(trainerId);
    const now = new Date();
    const futureActiveBookings = allTrainerBookings.filter(
      (b) =>
        (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.RESCHEDULE_PENDING) &&
        new Date(b.startTime).getTime() > now.getTime(),
    );

    const conflictingBookings: Booking[] = [];
    const proposedFrom = new Date(availabilityPayload.effectiveFrom);
    const proposedUntil = new Date(availabilityPayload.effectiveUntil);
    proposedFrom.setHours(0, 0, 0, 0);
    proposedUntil.setHours(23, 59, 59, 999);

    const DAY_MAP: Record<number, DayOfWeek> = {
      0: "SUNDAY",
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
    };

    for (const booking of futureActiveBookings) {
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);

      // Date check
      if (bStart < proposedFrom || bStart > proposedUntil) {
        conflictingBookings.push(booking);
        continue;
      }

      // Shift check
      const dow = DAY_MAP[bStart.getDay()];
      const daySched = availabilityPayload.weeklySchedule.find((d) => d.dayOfWeek === dow);

      if (!daySched || !daySched.isAvailable || !daySched.shifts || daySched.shifts.length === 0) {
        conflictingBookings.push(booking);
        continue;
      }

      const bStartMin = bStart.getHours() * 60 + bStart.getMinutes();
      const bEndMin = bEnd.getHours() * 60 + bEnd.getMinutes();

      const isCovered = daySched.shifts.some(
        (shift) => bStartMin >= shift.startMinute && bEndMin <= shift.endMinute,
      );

      if (!isCovered) {
        conflictingBookings.push(booking);
      }
    }

    if (conflictingBookings.length > 0) {
      const conflictListStr = conflictingBookings
        .map((b) => `#${b.bookingNumber} (${new Date(b.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`)
        .join(", ");
      throw new AppError(
        STATUS.CONFLICT,
        `Cannot update availability. You have ${conflictingBookings.length} existing booking(s) that conflict with the proposed schedule: [${conflictListStr}]. Please reschedule or cancel these bookings first.`,
      );
    }

    const updatedAvailability = await this._availabilityRepository.updateByTrainerId(
      trainerId,
      availabilityPayload,
    );

    if (!updatedAvailability) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.AVAILABILITY.AVAILABILITY_NOT_FOUND);
    }

    return updatedAvailability;
  }

  async updateBookingSettings(
    trainerId: string,
    data: UpdateTrainerBookingSettingsDto,
  ): Promise<void> {
    await validateTrainerEligibility(
      trainerId,
      this._userRepository,
      this._trainerProfileRepository,
    );

    const existingSettings =
      await this._bookingSettingsRepository.getByTrainerId(trainerId);

    if (!existingSettings) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.COMMON.NOT_FOUND,
      );
    }

    if (data.serviceIds) {
      await validateSelectedCoachingServices(
        data.serviceIds,
        this._coachingRepository,
      );
    }

    validateTrainerBookingSettings({
      serviceIds: data.serviceIds ?? existingSettings.serviceIds,
      advanceNoticeHours: data.advanceNoticeHours ?? existingSettings.advanceNoticeHours,
      bufferMinutes: data.bufferMinutes ?? existingSettings.bufferMinutes,
      maximumBookingPerDay: data.maximumBookingPerDay ?? existingSettings.maximumBookingPerDay,
    });

    await this._bookingSettingsRepository.updateByTrainerId(trainerId, {
      serviceIds: data.serviceIds ?? existingSettings.serviceIds,
      advanceNoticeHours: data.advanceNoticeHours ?? existingSettings.advanceNoticeHours,
      bufferMinutes: data.bufferMinutes ?? existingSettings.bufferMinutes,
      maximumBookingPerDay: data.maximumBookingPerDay ?? existingSettings.maximumBookingPerDay,
    });
  }

  async createUnavailability(
    trainerId: string,
    data: SetupUnavailabilityDto,
  ): Promise<TrainerUnavailability> {
    await validateTrainerEligibility(
      trainerId,
      this._userRepository,
      this._trainerProfileRepository,
    );

    validateTrainerUnavailabilities([data]);

    // Prevent duplicate leave entries
    const existingList = await this._unavailabilityRepository.getByTrainerId(trainerId);
    const startInput = new Date(data.startDate);
    const endInput = new Date(data.endDate);

    const duplicate = existingList.find(
      (u) =>
        u.type === data.type &&
        new Date(u.startDate).getTime() === startInput.getTime() &&
        new Date(u.endDate).getTime() === endInput.getTime(),
    );

    if (duplicate) {
      return duplicate;
    }

    return await this._unavailabilityRepository.createOne({
      trainerId,
      type: data.type,
      startDate: startInput,
      endDate: endInput,
      reason: data.reason ?? "",
      status: "ACTIVE",
    });
  }

  async getUnavailabilities(
    trainerId: string,
  ): Promise<TrainerUnavailability[]> {
    return await this._unavailabilityRepository.getByTrainerId(trainerId);
  }

  async updateUnavailability(
    trainerId: string,
    unavailabilityId: string,
    data: Partial<SetupUnavailabilityDto>,
  ): Promise<TrainerUnavailability> {
    const existing = await this._unavailabilityRepository.findById(unavailabilityId);
    if (!existing || existing.trainerId !== trainerId) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    const updated = await this._unavailabilityRepository.updateById(unavailabilityId, {
      ...(data.type && { type: data.type }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.reason !== undefined && { reason: data.reason }),
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    return updated;
  }

  async deleteUnavailability(
    trainerId: string,
    unavailabilityId: string,
  ): Promise<void> {
    const existing = await this._unavailabilityRepository.findById(unavailabilityId);
    if (!existing || existing.trainerId !== trainerId) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    await this._unavailabilityRepository.deleteById(unavailabilityId);
  }

  async createOverride(
    trainerId: string,
    data: CreateTrainerOverrideDto,
  ): Promise<TrainerAvailabilityOverride> {
    await validateTrainerEligibility(
      trainerId,
      this._userRepository,
      this._trainerProfileRepository,
    );

    return await this._overrideRepository.createOne({
      trainerId,
      date: new Date(data.date),
      shifts: data.shifts.map((s) => ({
        startMinute: s.startMinute,
        endMinute: s.endMinute,
      })),
      reason: data.reason ?? "",
      status: "ACTIVE",
    });
  }

  async getOverrides(
    trainerId: string,
  ): Promise<TrainerAvailabilityOverride[]> {
    return await this._overrideRepository.getByTrainerId(trainerId);
  }

  async updateOverride(
    trainerId: string,
    overrideId: string,
    data: UpdateTrainerOverrideDto,
  ): Promise<TrainerAvailabilityOverride> {
    const existing = await this._overrideRepository.findById(overrideId);
    if (!existing || existing.trainerId !== trainerId) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    const updated = await this._overrideRepository.updateById(overrideId, {
      ...(data.date && { date: new Date(data.date) }),
      ...(data.shifts && {
        shifts: data.shifts.map((s) => ({
          startMinute: s.startMinute,
          endMinute: s.endMinute,
        })),
      }),
      ...(data.reason !== undefined && { reason: data.reason }),
      ...(data.status && { status: data.status }),
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    return updated;
  }

  async deleteOverride(
    trainerId: string,
    overrideId: string,
  ): Promise<void> {
    const existing = await this._overrideRepository.findById(overrideId);
    if (!existing || existing.trainerId !== trainerId) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.COMMON.NOT_FOUND);
    }

    await this._overrideRepository.deleteById(overrideId);
  }
}
