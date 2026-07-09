import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import { BOOKING_TYPES } from "../booking.types";
import { IBookingRepository } from "../interface/booking-repository.interface";
import { BookingModel } from "../models/booking.model";
import { ITrainerSlotRepository } from "../interface/trainer.slot-repository.interface";
import { CreateBookingDto } from "../dto/booking.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import {
  BOOKING_STATUS,
  SLOT_STATUS,
} from "@/constants/constant.values.ts/booking.constant";
import { ROLES, Role } from "@/constants/constant.values.ts/roles";

@injectable()
export class BookingValidation {
  constructor(
    @inject(BOOKING_TYPES.TrainerSlotRepository)
    private readonly _slotRepository: ITrainerSlotRepository,
    @inject(BOOKING_TYPES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository
  ) {}

  // validate user creates a booking 

  async validateCreateBooking(
    userId: string,
    dto: CreateBookingDto
  ): Promise<void> {
    // find existing slot
    const slot = await this._slotRepository.findSlotById(dto.slotId);
    if (!slot) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.SLOT.SLOT_NOT_FOUND);
    }

    // slot ava
    if (slot.status !== SLOT_STATUS.AVAILABLE) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SLOT.SLOT_NOT_AVAILABLE);
    }

    // existing booking
    const existing = await this._bookingRepository.findUserActiveBookingForSlot(
      userId,
      dto.slotId
    );
    if (existing) {
      throw new AppError(
        STATUS.CONFLICT,
        MESSAGES.BOOKING.BOOKING_ALREADY_EXISTS
      );
    }

    // rejected booking for this specific slot
    const rejectedBooking = await BookingModel.findOne({
      userId: new Types.ObjectId(userId),
      slotId: new Types.ObjectId(dto.slotId),
      status: "rejected",
    }).exec();
    if (rejectedBooking) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "You cannot request booking for a slot that has been rejected by the trainer."
      );
    }
  }

  // ── Validate: trainer accepts or rejects a booking ────────────────────────
  //
  // Returns the booking so the service can use its slotId.

  async validateTrainerBookingAction(
    trainerId: string,
    bookingId: string
  ): Promise<{ bookingId: string; slotId: string }> {
    // booking must exist
    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
    }

    // check pending
    if (booking.status !== BOOKING_STATUS.PENDING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.BOOKING.BOOKING_NOT_PENDING
      );
    }

    // slot belongs to trainer
    const slot = await this._slotRepository.findSlotById(booking.slotId);
    if (!slot || slot.trainerId !== trainerId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.BOOKING.BOOKING_UNAUTHORIZED
      );
    }

    return { bookingId: booking.id, slotId: booking.slotId };
  }

  // user or trainer booking validate

  async validateCancelBooking(
    requesterId: string,
    role: Role,
    bookingId: string
  ): Promise<{ bookingId: string; slotId: string }> {
   
    const booking = await this._bookingRepository.findBookingById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
    }

    
    const cancellable: string[] = [
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.ACCEPTED,
    ];
    if (!cancellable.includes(booking.status)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.BOOKING.BOOKING_CANNOT_CANCEL
      );
    }

    // role validation
    if (role === ROLES.USER && booking.userId !== requesterId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.BOOKING.BOOKING_UNAUTHORIZED
      );
    }

    if (role === ROLES.TRAINER) {
      const slot = await this._slotRepository.findSlotById(booking.slotId);
      if (!slot || slot.trainerId !== requesterId) {
        throw new AppError(
          STATUS.FORBIDDEN,
          MESSAGES.BOOKING.BOOKING_UNAUTHORIZED
        );
      }
    }

    return { bookingId: booking.id, slotId: booking.slotId };
  }
}
