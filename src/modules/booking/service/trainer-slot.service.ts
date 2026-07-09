import { inject, injectable } from "inversify";
import { ITrainerSlotService } from "../interface/trainer.slot-service.interface";
import { BOOKING_TYPES } from "../booking.types";
import { ITrainerSlotRepository } from "../interface/trainer.slot-repository.interface";
import { ITrainerAvailabilityRepository } from "../interface/trainer.availability-repository.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { SLOT_STATUS } from "@/constants/constant.values.ts/booking.constant";
import { CreateSlot, GetSlotsFilter, GetSlotsQuery, TrainerSlot } from "../interface/trainer-slot.interface";
import { PaginatedResult } from "../interface/booking.interface";
import { BookingModel } from "../models/booking.model";
import { TrainerProfileModel } from "../../trainer/model/trainer-profile.model";


@injectable()
export class TrainerSlotService implements ITrainerSlotService {
  constructor(
    @inject(BOOKING_TYPES.TrainerSlotRepository)
    private _trainerSlotRepository: ITrainerSlotRepository,
    @inject(BOOKING_TYPES.TrainerAvailabilityRepository)
    private _trainerAvailabilityRepository: ITrainerAvailabilityRepository
  ) {}

  // ── Generate slots from availability ──────────────────────────────────────
  //
  // Algorithm: Sliding window.
  //   For each shift, start at shift.startTime, advance by duration (minutes)
  //   until adding one more slot would exceed shift.endTime.
  //   Any leftover time smaller than duration is silently discarded.
  //
  // Example: shift 09:00–11:00, duration=60 → [09:00–10:00, 10:00–11:00]
  // Example: shift 09:00–10:30, duration=60 → [09:00–10:00]  (30 min leftover)
  // Example: shift 09:00–10:30, duration=45 → [09:00–09:45, 09:45–10:30]
  //
  // All slots are bulk-inserted with a single insertMany call.

  async generateTrainerSlot(availabilityId: string): Promise<void> {
    const availability =
      await this._trainerAvailabilityRepository.findAvailabilityById(
        availabilityId
      );

    if (!availability) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.AVAILABILITY.AVAILABILITY_NOT_FOUND
      );
    }

    const slotsToInsert: CreateSlot[] = [];
    const durationMs = (minutes: number) => minutes * 60 * 1_000;

    for (const av of availability.availability) {
      for (const shift of av.shifts) {
        const slotDuration = durationMs(shift.duration);
        let cursor = new Date(shift.startTime).getTime();
        const shiftEnd = new Date(shift.endTime).getTime();

        while (cursor + slotDuration <= shiftEnd) {
          slotsToInsert.push({
            availabilityId: availability.id,
            trainerId: availability.trainerId,
            startTime: new Date(cursor),
            endTime: new Date(cursor + slotDuration),
            status: SLOT_STATUS.AVAILABLE,
          });
          cursor += slotDuration;
        }
      }
    }

    if (slotsToInsert.length > 0) {
      await this._trainerSlotRepository.insertManySlots(slotsToInsert);
    }
  }

  // ── Get trainer's own slots (all statuses, optional filter) ───────────────

  async getTrainerSlots(
    trainerId: string,
    filter?: GetSlotsFilter
  ): Promise<TrainerSlot[]> {
    return this._trainerSlotRepository.findSlotsByTrainerId(trainerId, filter);
  }

  async getTrainerSlotsPaginated(
    trainerId: string,
    filter: GetSlotsQuery
  ): Promise<PaginatedResult<TrainerSlot>> {
    return this._trainerSlotRepository.findSlotsByTrainerIdPaginated(trainerId, filter);
  }

  // ── Get trainer's available slots for user booking ────────────────────────
  //
  // Only returns AVAILABLE slots with startTime in the future.


  async getTrainerAvailableSlots(trainerIdOrProfileId: string): Promise<TrainerSlot[]> {
    let resolvedTrainerId = trainerIdOrProfileId;
    
    // Resolve profileId to userId if necessary
    const mongoose = await import("mongoose");
    if (mongoose.Types.ObjectId.isValid(trainerIdOrProfileId)) {
      const profile = await TrainerProfileModel.findById(trainerIdOrProfileId).lean().exec();
      if (profile && profile.userId) {
        resolvedTrainerId = profile.userId.toString();
      }
    }

    return this._trainerSlotRepository.findSlotsByTrainerId(resolvedTrainerId, {
      status: SLOT_STATUS.AVAILABLE,
      from: new Date(),
    });
  }

  async blockSlot(trainerId: string, slotId: string): Promise<void> {
    const slot = await this._trainerSlotRepository.findSlotById(slotId);
    if (!slot || slot.trainerId !== trainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.BOOKING.BOOKING_UNAUTHORIZED);
    }

    // Cancel / reject all bookings associated with this slot
    await BookingModel.updateMany(
      { slotId: slot.id, status: "pending" },
      { status: "rejected", cancelReason: "Slot blocked by trainer", cancelledBy: "trainer" }
    ).exec();

    await BookingModel.updateMany(
      { slotId: slot.id, status: "accepted" },
      { status: "cancelled_by_trainer", cancelReason: "Slot blocked by trainer", cancelledBy: "trainer" }
    ).exec();

    await this._trainerSlotRepository.updateSlotStatus(slotId, SLOT_STATUS.BLOCKED);
  }

  async unblockSlot(trainerId: string, slotId: string): Promise<void> {
    const slot = await this._trainerSlotRepository.findSlotById(slotId);
    if (!slot || slot.trainerId !== trainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.BOOKING.BOOKING_UNAUTHORIZED);
    }

    await this._trainerSlotRepository.updateSlotStatus(slotId, SLOT_STATUS.AVAILABLE);
  }
}