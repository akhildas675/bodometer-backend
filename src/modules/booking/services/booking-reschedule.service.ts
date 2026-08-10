import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { BOOKING_TYPES } from "../booking.types";
import { USER_TYPES } from "@/modules/user/user.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";

import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { IBookingAuditLogRepository } from "../interface/repository.interface/booking-audit-log-repository.interface";
import { IBookingRescheduleRequestRepository } from "../repositories/booking-reschedule-request.repository";
import { IBookingSlotEngineService } from "../interface/service.interface/booking-slot-engine-service.interface";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";
import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";

import {
  IBookingRescheduleService,
  RespondRescheduleParams,
  RespondRescheduleResult,
  TrainerProposeRescheduleParams,
  WithdrawRescheduleParams,
} from "../interface/service.interface/booking-reschedule-service.interface";
import { Booking } from "../interface/domain/booking.interface";
import { BookingRescheduleRequest } from "../interface/domain/booking-reschedule-request.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import {
  AUDIT_LOG_ACTION,
  BOOKING_STATUS,
  MS_PER_HOUR,
  RESCHEDULE_EXPIRY_HOURS,
  RESCHEDULE_STATUS,
} from "@/constants/constant.values.ts/booking.constant";

@injectable()
export class BookingRescheduleService implements IBookingRescheduleService {
  constructor(
    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(BOOKING_TYPES.BookingAuditLogRepository)
    private _auditLogRepository: IBookingAuditLogRepository,

    @inject(BOOKING_TYPES.BookingRescheduleRequestRepository)
    private _rescheduleRepository: IBookingRescheduleRequestRepository,

    @inject(BOOKING_TYPES.BookingSlotEngineService)
    private _slotEngineService: IBookingSlotEngineService,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,
  ) {}

  private async resolveTrainerUserId(trainerId: string): Promise<string> {
    const userDoc = await this._userRepository.findById(trainerId);
    if (userDoc) return trainerId;

    const profileDoc = await this._trainerProfileRepository.findById(trainerId);
    if (profileDoc && profileDoc.userId) {
      return profileDoc.userId.toString();
    }
    return trainerId;
  }

  async proposeByTrainer(
    params: TrainerProposeRescheduleParams,
  ): Promise<BookingRescheduleRequest> {
    const { bookingId, trainerId, proposedStartTime, proposedEndTime, proposedBufferEndTime, reason } = params;
    const actualTrainerId = await this.resolveTrainerUserId(trainerId);

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.CANCELLATION.SESSION_NOT_FOUND);
    }
    if (booking.trainerId !== actualTrainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.RESCHEDULE.UNAUTHORIZED_PROPOSE);
    }
    if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RESCHEDULE.CANNOT_RESCHEDULE_CANCELLED_OR_COMPLETED);
    }

    // 24h Expiry
    const expiresAt = new Date(Date.now() + RESCHEDULE_EXPIRY_HOURS * MS_PER_HOUR);

    const request = await this._rescheduleRepository.createOne({
      bookingId: booking.id,
      requestedBy: "TRAINER",
      requestedByUserId: actualTrainerId,
      oldStartTime: booking.startTime,
      oldEndTime: booking.endTime,
      proposedStartTime: new Date(proposedStartTime),
      proposedEndTime: new Date(proposedEndTime),
      proposedBufferEndTime: new Date(proposedBufferEndTime),
      reason,
      status: RESCHEDULE_STATUS.PENDING,
      expiresAt,
    });

    // Update status
    await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.RESCHEDULE_PENDING);
    booking.status = BOOKING_STATUS.RESCHEDULE_PENDING;

    await this._auditLogRepository.createOne({
      bookingId: booking.id,
      action: AUDIT_LOG_ACTION.RESCHEDULE_PROPOSED,
      performedBy: actualTrainerId,
      oldValue: { startTime: booking.startTime },
      newValue: { proposedStartTime, requestId: request.id },
    });

    return request;
  }

  async respondToProposal(params: RespondRescheduleParams): Promise<RespondRescheduleResult> {
    const { requestId, userId, accept, reason } = params;

    const request = await this._rescheduleRepository.findById(requestId);
    if (!request || request.status !== RESCHEDULE_STATUS.PENDING) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RESCHEDULE.RESCHEDULE_NOT_PENDING);
    }

    const booking = await this._bookingRepository.findById(request.bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.CANCELLATION.SESSION_NOT_FOUND);
    }
    if (booking.userId !== userId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.RESCHEDULE.UNAUTHORIZED_RESPOND);
    }

    // 24h Expiry
    if (request.expiresAt && new Date() > new Date(request.expiresAt)) {
      await this._rescheduleRepository.updateStatus(request.id, RESCHEDULE_STATUS.EXPIRED, MESSAGES.RESCHEDULE.PROPOSAL_EXPIRED_REASON);
      await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CONFIRMED);
      booking.status = BOOKING_STATUS.CONFIRMED;
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.RESCHEDULE.RESCHEDULE_EXPIRED,
      );
    }

    if (accept) {
      // Slot validation
      const proposedStartMs = new Date(request.proposedStartTime).getTime();
      const proposedEndMs = new Date(request.proposedEndTime).getTime();

      const existingBookings = await this._bookingRepository.findByTrainerAndDate(
        booking.trainerId,
        request.proposedStartTime,
      );

      const hasConflict = existingBookings.some((b) => {
        if (b.id === booking.id) return false; 
        if (b.status === BOOKING_STATUS.CANCELLED || b.status === "NO_SHOW") return false;

        const bStart = new Date(b.startTime).getTime();
        const bBufferEnd = new Date(b.bufferEndTime).getTime();
        return proposedStartMs < bBufferEnd && proposedEndMs > bStart;
      });

      if (hasConflict) {
        throw new AppError(
          STATUS.CONFLICT,
          MESSAGES.RESCHEDULE.RESCHEDULE_CONFLICT,
        );
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const updatedBooking = await this._bookingRepository.updateTimes(
          booking.id,
          request.proposedStartTime,
          request.proposedEndTime,
          request.proposedBufferEndTime,
          request.proposedStartTime,
          BOOKING_STATUS.CONFIRMED,
          session,
        );

        const updatedRequest = await this._rescheduleRepository.updateStatus(
          request.id,
          RESCHEDULE_STATUS.ACCEPTED,
          reason,
          session,
        );

        await this._auditLogRepository.createOne(
          {
            bookingId: booking.id,
            action: AUDIT_LOG_ACTION.RESCHEDULED,
            performedBy: userId,
            oldValue: { startTime: booking.startTime },
            newValue: { startTime: request.proposedStartTime },
          },
          session,
        );

        await session.commitTransaction();
        await session.endSession();

        return { request: updatedRequest || request, booking: updatedBooking || booking };
      } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        throw err;
      }
    } else {
      
      const updatedRequest = await this._rescheduleRepository.updateStatus(request.id, RESCHEDULE_STATUS.REJECTED, reason);
      await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CONFIRMED);
      booking.status = BOOKING_STATUS.CONFIRMED;
      return { request: updatedRequest || request, booking };
    }
  }

  async withdrawProposal(params: WithdrawRescheduleParams): Promise<BookingRescheduleRequest> {
    const { requestId, trainerId, reason } = params;
    const actualTrainerId = await this.resolveTrainerUserId(trainerId);

    const request = await this._rescheduleRepository.findById(requestId);
    if (!request || request.status !== RESCHEDULE_STATUS.PENDING) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.RESCHEDULE.RESCHEDULE_NOT_PENDING);
    }
    if (request.requestedByUserId !== actualTrainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.RESCHEDULE.UNAUTHORIZED_WITHDRAW);
    }

    const updated = await this._rescheduleRepository.updateStatus(request.id, RESCHEDULE_STATUS.CANCELLED, reason || MESSAGES.RESCHEDULE.WITHDRAWN_REASON);
    await this._bookingRepository.updateStatus(request.bookingId, BOOKING_STATUS.CONFIRMED);
    return updated || request;
  }

  async getPendingRequestsForUser(userId: string): Promise<{ request: BookingRescheduleRequest; booking: Booking }[]> {
    const userBookings = await this._bookingRepository.findByUserId(userId);
    const result: { request: BookingRescheduleRequest; booking: Booking }[] = [];

    for (const b of userBookings) {
      const pending = await this._rescheduleRepository.findPendingByBookingId(b.id);
      if (pending) {
        if (pending.expiresAt && new Date() > new Date(pending.expiresAt)) {
          // Auto-expire proposal past 24 hours
          await this._rescheduleRepository.updateStatus(pending.id, RESCHEDULE_STATUS.EXPIRED, MESSAGES.RESCHEDULE.PROPOSAL_EXPIRED_REASON);
          await this._bookingRepository.updateStatus(b.id, BOOKING_STATUS.CONFIRMED);
        } else {
          result.push({ request: pending, booking: b });
        }
      }
    }

    return result;
  }
}
