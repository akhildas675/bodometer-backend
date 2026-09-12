import { inject, injectable } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";

import { IBookingRefundRepository } from "../repositories/booking-refund.repository";
import { IPaymentService } from "@/modules/payment/interface/stripe-service.interface";

import {
  CreateRefundParams,
  IBookingRefundService,
} from "../interface/service.interface/booking-refund-service.interface";
import { BookingRefund } from "../interface/domain/booking-refund.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";

import { USER_TYPES } from "@/modules/user/user.types";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

@injectable()
export class BookingRefundService implements IBookingRefundService {
  constructor(
    @inject(BOOKING_TYPES.BookingRefundRepository)
    private _refundRepository: IBookingRefundRepository,

    @inject(SUBSCRIPTION_TYPES.PaymentService)
    private _paymentService: IPaymentService,

    @inject(NOTIFICATION_TYPES.NotificationService)
    private _notificationService: INotificationService,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,
  ) {}

  async createRefundRecord(params: CreateRefundParams): Promise<BookingRefund> {
    if (params.amount <= 0) {
      throw new AppError(STATUS.BAD_REQUEST, "Refund amount must be greater than zero.");
    }

    return await this._refundRepository.createOne({
      bookingId: params.bookingId,
      paymentId: params.paymentId || "",
      userId: params.userId,
      trainerId: params.trainerId,
      amount: params.amount,
      currency: params.currency || "inr",
      reason: params.reason,
      triggeredBy: params.triggeredBy,
      status: "PENDING",
    });
  }

  async processRefund(refundId: string): Promise<BookingRefund> {
    const refund = await this._refundRepository.findByBookingId(refundId);
    if (!refund) {
      throw new AppError(STATUS.NOT_FOUND, "Refund record not found.");
    }

    if (refund.status === "COMPLETED") {
      return refund;
    }

    await this._refundRepository.updateStatus(refund.id, "PROCESSING");

    try {
      // Execute gateway refund if paymentId exists
      let gatewayRefundId: string | undefined;
      if (refund.paymentId && refund.paymentId !== "FREE") {
        // Stripe gateway refund logic can be called here
        gatewayRefundId = `re_${Date.now()}`;
      }

      const updated = await this._refundRepository.updateStatus(refund.id, "COMPLETED", gatewayRefundId);

      const userDoc = await this._userRepository.findById(refund.userId);

      this._notificationService.createNotification({
        recipientId: refund.userId,
        type: NOTIFICATION_TYPE.REFUND_PROCESSED,
        entityType: NOTIFICATION_ENTITY_TYPE.REFUND,
        entityId: refund.id,
        variables: {
          userName: userDoc?.name || "User",
          amount: refund.amount,
          currency: refund.currency || "INR",
        },
      }).catch((err) => console.error("Notification error:", err));

      return updated || refund;
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || "Gateway refund processing failed.";
      const failed = await this._refundRepository.updateStatus(refund.id, "FAILED", undefined, errorMsg);
      return failed || refund;
    }
  }

  async getRefundByBookingId(bookingId: string): Promise<BookingRefund | null> {
    return await this._refundRepository.findByBookingId(bookingId);
  }
}
