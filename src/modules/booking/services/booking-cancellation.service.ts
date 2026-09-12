import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { BOOKING_TYPES } from "../booking.types";
import { USER_TYPES } from "@/modules/user/user.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";

import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { IBookingAuditLogRepository } from "../interface/repository.interface/booking-audit-log-repository.interface";
import { IBookingCancellationRepository } from "../repositories/booking-cancellation.repository";
import { IBookingRefundRepository } from "../repositories/booking-refund.repository";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";
import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { WALLET_TYPES } from "@/modules/wallet/wallet.types";
import { IWalletService } from "@/modules/wallet/services/wallet.service";

import {
  CancelBookingByTrainerParams,
  CancelBookingByUserParams,
  CancelBookingResult,
  IBookingCancellationService,
} from "../interface/service.interface/booking-cancellation-service.interface";
import { BookingRefund } from "../interface/domain/booking-refund.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import {
  AUDIT_LOG_ACTION,
  BOOKING_STATUS,
  CANCELLATION_REFUND_PERCENT,
} from "@/constants/constant.values.ts/booking.constant";
import {
  calculateTrainerCancellationPolicy,
  calculateUserCancellationPolicy,
} from "../utils/cancellation-policy.util";

@injectable()
export class BookingCancellationService implements IBookingCancellationService {
  constructor(
    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(BOOKING_TYPES.BookingAuditLogRepository)
    private _auditLogRepository: IBookingAuditLogRepository,

    @inject(BOOKING_TYPES.BookingCancellationRepository)
    private _cancellationRepository: IBookingCancellationRepository,

    @inject(BOOKING_TYPES.BookingRefundRepository)
    private _refundRepository: IBookingRefundRepository,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,

    @inject(WALLET_TYPES.WalletService)
    private _walletService: IWalletService,
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

  async cancelByUser(params: CancelBookingByUserParams): Promise<CancelBookingResult> {
    const { bookingId, userId, reason, reasonCode } = params;

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.CANCELLATION.SESSION_NOT_FOUND);
    }
    if (booking.userId !== userId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.CANCELLATION.UNAUTHORIZED_CANCEL);
    }
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.ALREADY_CANCELLED);
    }
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.CANNOT_CANCEL_COMPLETED);
    }

    // Policy calculation: check if session start window (10 min) has passed without trainer taking session
    const nowMs = Date.now();
    const startMs = new Date(booking.startTime).getTime();
    const isTrainerNoShow = nowMs > startMs + 10 * 60 * 1000;

    let policyResult = calculateUserCancellationPolicy(new Date(booking.startTime));
    if (isTrainerNoShow) {
      policyResult = {
        refundEligible: true,
        refundPercentage: 100,
        policyName: "TRAINER_NO_SHOW_EXPIRED_WINDOW",
        hoursNotice: 0,
      };
    }
    const refundAmount = (booking.price * policyResult.refundPercentage) / CANCELLATION_REFUND_PERCENT.FULL;
    const refundEligible = refundAmount > 0;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Create BookingCancellation record
      const cancellation = await this._cancellationRepository.createOne({
        bookingId: booking.id,
        cancelledBy: "USER",
        cancelledByUserId: userId,
        reasonCode: reasonCode || "USER_REQUEST",
        reason: reason || MESSAGES.CANCELLATION.DEFAULT_USER_REQUEST_REASON,
        cancelledAt: new Date(),
        refundEligible,
        refundPercentage: policyResult.refundPercentage,
        refundAmount,
        policySnapshot: {
          policyName: policyResult.policyName,
          hoursNotice: policyResult.hoursNotice,
          refundPercentage: policyResult.refundPercentage,
          appliedAt: new Date(),
        },
      });

      // 2. Create BookingRefund ONLY if refundAmount > 0 (No ₹0 refund records!)
      let refund: BookingRefund | undefined;
      if (refundEligible) {
        refund = await this._refundRepository.createOne({
          bookingId: booking.id,
          paymentId: booking.paymentId || "",
          userId: booking.userId,
          trainerId: booking.trainerId,
          amount: refundAmount,
          currency: "inr",
          reason: `Refund for cancellation (${policyResult.policyName})`,
          triggeredBy: "USER",
          status: "COMPLETED",
        });

        await this._walletService.creditWallet(
          {
            userId: booking.userId,
            amount: refundAmount,
            source: "BOOKING_REFUND",
            bookingId: booking.id,
            refundId: refund.id,
            description: `User cancellation refund (${policyResult.refundPercentage}%) for session #${booking.bookingNumber}`,
          },
          session,
        );
      }

      // 3. Update Booking Status -> CANCELLED
      const updatedBooking = await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CANCELLED);

      await this._auditLogRepository.createOne({
        bookingId: booking.id,
        action: AUDIT_LOG_ACTION.CANCELLED,
        performedBy: userId,
        oldValue: { status: booking.status },
        newValue: { status: BOOKING_STATUS.CANCELLED, refundPercentage: policyResult.refundPercentage, refundAmount },
      });

      await session.commitTransaction();
      await session.endSession();

      return {
        booking: updatedBooking || booking,
        cancellation,
        refund,
      };
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      throw err;
    }
  }

  async cancelByTrainer(params: CancelBookingByTrainerParams): Promise<CancelBookingResult> {
    const { bookingId, trainerId, reason, reasonCode } = params;

    if (!reason || !reason.trim()) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.CANCELLATION_REASON_REQUIRED);
    }

    const actualTrainerId = await this.resolveTrainerUserId(trainerId);

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.CANCELLATION.SESSION_NOT_FOUND);
    }
    if (booking.trainerId !== actualTrainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.CANCELLATION.UNAUTHORIZED_CANCEL);
    }
    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.ALREADY_CANCELLED);
    }
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.CANNOT_CANCEL_COMPLETED);
    }

    // Trainer cancellation policy
    const policyResult = calculateTrainerCancellationPolicy(new Date(booking.startTime));
    const refundAmount = booking.price;
    const refundEligible = refundAmount > 0;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cancellation = await this._cancellationRepository.createOne({
        bookingId: booking.id,
        cancelledBy: "TRAINER",
        cancelledByUserId: actualTrainerId,
        reasonCode: reasonCode || "TRAINER_SCHEDULE_CONFLICT",
        reason,
        cancelledAt: new Date(),
        refundEligible,
        refundPercentage: CANCELLATION_REFUND_PERCENT.FULL,
        refundAmount,
        policySnapshot: {
          policyName: policyResult.policyName,
          hoursNotice: policyResult.hoursNotice,
          refundPercentage: CANCELLATION_REFUND_PERCENT.FULL,
          appliedAt: new Date(),
        },
      });

      let refund: BookingRefund | undefined;
      if (refundEligible) {
        refund = await this._refundRepository.createOne({
          bookingId: booking.id,
          paymentId: booking.paymentId || "",
          userId: booking.userId,
          trainerId: booking.trainerId,
          amount: refundAmount,
          currency: "inr",
          reason: `Trainer cancellation full refund: ${reason}`,
          triggeredBy: "TRAINER",
          status: "COMPLETED",
        });

        await this._walletService.creditWallet(
          {
            userId: booking.userId,
            amount: refundAmount,
            source: "BOOKING_REFUND",
            bookingId: booking.id,
            refundId: refund.id,
            description: `Trainer cancellation 100% refund for session #${booking.bookingNumber}`,
          },
          session,
        );
      }

      const updatedBooking = await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CANCELLED);

      await this._auditLogRepository.createOne({
        bookingId: booking.id,
        action: AUDIT_LOG_ACTION.CANCELLED,
        performedBy: actualTrainerId,
        oldValue: { status: booking.status },
        newValue: { status: BOOKING_STATUS.CANCELLED, refundPercentage: CANCELLATION_REFUND_PERCENT.FULL, refundAmount },
      });

      await session.commitTransaction();
      await session.endSession();

      return {
        booking: updatedBooking || booking,
        cancellation,
        refund,
      };
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      throw err;
    }
  }
}
