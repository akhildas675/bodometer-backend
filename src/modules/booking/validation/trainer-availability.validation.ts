import { injectable, inject } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { ITrainerAvailabilityRepository } from "../interface/trainer.availability-repository.interface";
import { CreateAvailabilityDto } from "../dto/booking.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { SLOT_DURATION } from "@/constants/constant.values.ts/booking.constant";


@injectable()
export class TrainerAvailabilityValidation {
  constructor(
    @inject(BOOKING_TYPES.TrainerAvailabilityRepository)
    private readonly trainerAvailabilityRepository: ITrainerAvailabilityRepository
  ) {}

  async validateCreateAvailability(
    trainerId: string,
    data: CreateAvailabilityDto
  ): Promise<void> {
      this.validateEmptyShifts(data);
      this.validateMaxShifts(data)
    this.validateDate(data);
    this.validateShiftTime(data);
    this.validateDuration(data);
    this.validateShiftOverlap(data);

    await this.validateExistingAvailability(trainerId, data);
  }

  private validateEmptyShifts(data: CreateAvailabilityDto): void {
    if (!data.shifts.length) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.AVAILABILITY.EMPTY_SHIFT
      );
    }
  }

  private validateDate(data: CreateAvailabilityDto): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(data.date);

    if (selectedDate.getTime() < today.getTime()) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.AVAILABILITY.PAST_DATE_NOT_ALLOWED
      );
    }

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    if (selectedDate.getTime() > maxDate.getTime()) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.AVAILABILITY.DATE_OUT_OF_RANGE
      );
    }

    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();

      for (const shift of data.shifts) {
        const start = new Date(shift.startTime);

        if (start.getTime() <= now.getTime()) {
          throw new AppError(
            STATUS.BAD_REQUEST,
            MESSAGES.AVAILABILITY.PAST_TIME_NOT_ALLOWED
          );
        }
      }
    }
  }

  private validateShiftTime(data: CreateAvailabilityDto): void {
    for (const shift of data.shifts) {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);

      if (start.getTime() === end.getTime()) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.AVAILABILITY.SAME_START_AND_END_TIME
        );
      }

      if (start.getTime() > end.getTime()) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.AVAILABILITY.INVALID_TIME_RANGE
        );
      }

      if (
        start.getFullYear() !== end.getFullYear() ||
        start.getMonth() !== end.getMonth() ||
        start.getDate() !== end.getDate()
      ) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.AVAILABILITY.CROSS_MIDNIGHT_NOT_ALLOWED
        );
      }

      const shiftMinutes =
        (end.getTime() - start.getTime()) / (1000 * 60);

      if (shiftMinutes < shift.duration) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.AVAILABILITY.INVALID_SHIFT_DURATION
        );
      }
    }
  }

  private validateDuration(data: CreateAvailabilityDto): void {
    const validDurations = Object.values(SLOT_DURATION);

    for (const shift of data.shifts) {
      if (!validDurations.includes(shift.duration)) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.AVAILABILITY.INVALID_SLOT_DURATION
        );
      }
    }
  }

  private validateShiftOverlap(data: CreateAvailabilityDto): void {
    const sorted = [...data.shifts].sort(
      (a, b) =>
        new Date(a.startTime).getTime() -
        new Date(b.startTime).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const currentEnd = new Date(sorted[i].endTime);
      const nextStart = new Date(sorted[i + 1].startTime);

      if (currentEnd.getTime() > nextStart.getTime()) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.AVAILABILITY.SHIFT_OVERLAP
        );
      }
    }
  }

  private async validateExistingAvailability(
    trainerId: string,
    data: CreateAvailabilityDto
  ): Promise<void> {
    const existing =
      await this.trainerAvailabilityRepository.findByTrainerId(
        trainerId
      );

    if (!existing) return;

    const selectedDate = new Date(data.date);

    const availability = existing.availability.find(
      (a) =>
        new Date(a.date).toDateString() ===
        selectedDate.toDateString()
    );

    if (!availability) return;

    for (const existingShift of availability.shifts) {
      const existingStart = new Date(existingShift.startTime);
      const existingEnd = new Date(existingShift.endTime);

      for (const newShift of data.shifts) {
        const newStart = new Date(newShift.startTime);
        const newEnd = new Date(newShift.endTime);

        const overlap =
          existingStart.getTime() < newEnd.getTime() &&
          newStart.getTime() < existingEnd.getTime();

        if (overlap) {
          throw new AppError(
            STATUS.BAD_REQUEST,
            MESSAGES.AVAILABILITY.EXISTING_AVAILABILITY_OVERLAP
          );
        }
      }
    }
  }

  private validateMaxShifts(data: CreateAvailabilityDto): void {
  const MAX_SHIFTS = 4;

  if (data.shifts.length > MAX_SHIFTS) {
    throw new AppError(
      STATUS.BAD_REQUEST,
      MESSAGES.AVAILABILITY.MAXIMUM_SHIFT_LIMIT
    );
  }
}
}