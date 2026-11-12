import { inject, injectable } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { COACHING_TYPES } from "@/modules/coaching/coaching.types";
import { USER_TYPES } from "@/modules/user/user.types";

import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { IBookingAuditLogRepository } from "../interface/repository.interface/booking-audit-log-repository.interface";
import { IBookingCancellationRepository } from "../repositories/booking-cancellation.repository";
import { IBookingRescheduleRequestRepository } from "../repositories/booking-reschedule-request.repository";
import { IBookingSlotEngineService } from "../interface/service.interface/booking-slot-engine-service.interface";
import { IPaymentService } from "@/modules/payment/interface/stripe-service.interface";
import { ICoachingRepository } from "@/modules/coaching/interface/coaching-repository.interface";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import {
  CreateBookingInput,
  CreateBookingResponse,
  IBookingService,
  VerifyPaymentInput,
} from "../interface/service.interface/booking-service.interface";
import { Booking } from "../interface/domain/booking.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AUDIT_LOG_ACTION, BOOKING_STATUS, SLOT_HOLD_MS } from "@/constants/constant.values.ts/booking.constant";
import { randomUUID } from "crypto";
import { IBookingRefundService } from "../interface/service.interface/booking-refund-service.interface";

function generateBookingNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK-${dateStr}-${rand}`;
}

import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { WALLET_TYPES } from "@/modules/wallet/wallet.types";
import { IWalletService } from "@/modules/wallet/interface/service.interface/wallet-service.interface";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

import { IUserSubscriptionRepository } from "@/modules/subscription/interface/repository.interface/user.subscription.repository.interface";
import { WALLET_OWNER_TYPE, WALLET_TRANSACTION_SOURCE } from "@/modules/wallet/constants/wallet.constants";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(BOOKING_TYPES.BookingAuditLogRepository)
    private _auditLogRepository: IBookingAuditLogRepository,

    @inject(BOOKING_TYPES.BookingSlotEngineService)
    private _slotEngineService: IBookingSlotEngineService,

    @inject(SUBSCRIPTION_TYPES.PaymentService)
    private _paymentService: IPaymentService,

    @inject(COACHING_TYPES.CoachingRepository)
    private _coachingRepository: ICoachingRepository,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,

    @inject(WALLET_TYPES.WalletService)
    private _walletService: IWalletService,

    @inject(NOTIFICATION_TYPES.NotificationService)
    private _notificationService: INotificationService,

    @inject(SUBSCRIPTION_TYPES.UserSubscriptionRepository)
    private _userSubscriptionRepository: IUserSubscriptionRepository,

    @inject(BOOKING_TYPES.BookingCancellationRepository)
    private _cancellationRepository: IBookingCancellationRepository,

    @inject(BOOKING_TYPES.BookingRescheduleRequestRepository)
    private _rescheduleRepository: IBookingRescheduleRequestRepository,

    @inject(BOOKING_TYPES.BookingRefundService)
    private _refundService: IBookingRefundService,
  ) { }

  async createBooking(input: CreateBookingInput): Promise<CreateBookingResponse> {
    const { userId, trainerId, serviceId, bookingDate, startTime, endTime, bufferEndTime } = input;

    // 0. Verify active subscription
    const activeSub = await this._userSubscriptionRepository.findActiveByUserId(userId);
    if (!activeSub) {
      throw new AppError(
        STATUS.FORBIDDEN,
        "Active subscription required to book a session. Please subscribe to a plan.",
      );
    }

    // 0.1 Verify user has no conflicting overlapping booking at the same time
    const userConflicts = await this._bookingRepository.findUserConflictingBookings(
      userId,
      new Date(startTime),
      new Date(bufferEndTime),
    );

    if (userConflicts.length > 0) {
      throw new AppError(
        STATUS.CONFLICT,
        "You already have another active booking during this time slot. You cannot book multiple trainers at the same time.",
      );
    }

    let actualTrainerUserId = trainerId;
    const userDoc = await this._userRepository.findById(trainerId);
    if (!userDoc) {
      const profileDoc = await this._trainerProfileRepository.findById(trainerId);
      if (profileDoc && profileDoc.userId) {
        actualTrainerUserId = profileDoc.userId.toString();
      }
    }

    // 1. Re-validate slot using dynamic slot engine to prevent double booking race condition
    const availableSlots = await this._slotEngineService.calculateAvailableSlots({
      trainerId: actualTrainerUserId,
      date: bookingDate,
      serviceId,
    });

    const startIso = new Date(startTime).toISOString();
    const isSlotAvailable = availableSlots.some((slot) => slot.startTime === startIso);

    if (!isSlotAvailable) {
      throw new AppError(
        STATUS.CONFLICT,
        MESSAGES.BOOKING.SLOT_UNAVAILABLE,
      );
    }

    // 2. Fetch Coaching Service & User
    const coachingService = await this._coachingRepository.getCoachingServiceById(serviceId);
    if (!coachingService) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.COACHING_SERVICE_NOT_FOUND);
    }

    const price = Number(coachingService.price) || 0;
    const bookingNumber = generateBookingNumber();
    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);
    const holdToken = randomUUID();
    const holdExpiresAt = new Date(Date.now() + SLOT_HOLD_MS);

    // 3. Atomically acquire the slot hold before creating the booking.
    //    Only one user can hold a slot at a time; expired holds are re-acquirable.
    const holdAcquired = await this._bookingRepository.acquireSlotHold({
      trainerId: actualTrainerUserId,
      serviceId,
      startTime: slotStart,
      endTime: slotEnd,
      userId,
      holdToken,
      holdExpiresAt,
    });

    if (!holdAcquired) {
      throw new AppError(
        STATUS.CONFLICT,
        MESSAGES.BOOKING.SLOT_UNAVAILABLE,
      );
    }

    // 4. Create Booking Document (Status: PENDING_PAYMENT)
    let booking: Booking;
    try {
      booking = await this._bookingRepository.createOne({
        bookingNumber,
        trainerId: actualTrainerUserId,
        userId,
        serviceId,
        bookingDate: new Date(bookingDate),
        startTime: slotStart,
        endTime: slotEnd,
        bufferEndTime: new Date(bufferEndTime),
        status: BOOKING_STATUS.PENDING_PAYMENT,
        price,
        holdToken,
        holdExpiresAt,
        attendance: { status: "PENDING" },
      });
      await this._bookingRepository.attachBookingToSlot(
        actualTrainerUserId,
        serviceId,
        slotStart,
        booking.id,
      );
    } catch (err) {
      await this._bookingRepository
        .releaseSlotHold({
          trainerId: actualTrainerUserId,
          serviceId,
          startTime: slotStart,
          holdToken,
        })
        .catch(() => undefined);
      throw err;
    }

    // 4. Create Audit Log Entry
    await this._auditLogRepository.createOne({
      bookingId: booking.id,
      action: AUDIT_LOG_ACTION.CREATED,
      performedBy: userId,
      newValue: {
        bookingNumber,
        trainerId,
        serviceId,
        startTime,
        endTime,
        status: BOOKING_STATUS.PENDING,
        price,
      },
    });

    // Payment
    let checkoutUrl: string | undefined;
    let sessionId: string | undefined;

    if (price > 0) {
      const wallet = await this._walletService.getOrCreateWallet(userId, WALLET_OWNER_TYPE.USER);
      const chosenMethod = input.paymentMethod || (wallet.balance >= price ? "WALLET" : "ONLINE");

      if (chosenMethod === "WALLET") {
        if (wallet.balance < price) {
          throw new AppError(
            STATUS.BAD_REQUEST,
            `Insufficient wallet balance (Available: ₹${wallet.balance}, Required: ₹${price}). Please add funds or select Online Payment.`,
          );
        }

        const { transaction } = await this._walletService.debitWallet({
          ownerId: userId,
          ownerType: WALLET_OWNER_TYPE.USER,
          amount: price,
          source: WALLET_TRANSACTION_SOURCE.BOOKING_PAYMENT,
          bookingId: booking.id,
          description: `Wallet payment for coaching session #${bookingNumber}`,
        });

        await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CONFIRMED, transaction.id);
        booking.status = BOOKING_STATUS.CONFIRMED;
        booking.paymentId = transaction.id;

        const slotConfirmed = await this._bookingRepository.confirmSlotHold({
          trainerId: actualTrainerUserId,
          serviceId,
          startTime: slotStart,
          holdToken,
          bookingId: booking.id,
        });
        if (!slotConfirmed) {
          console.error(`Slot hold confirm failed for booking ${booking.id}`);
        }

        await this._auditLogRepository.createOne({
          bookingId: booking.id,
          action: AUDIT_LOG_ACTION.STATUS_CHANGED,
          performedBy: userId,
          oldValue: { status: BOOKING_STATUS.PENDING_PAYMENT },
          newValue: { status: BOOKING_STATUS.CONFIRMED, paymentId: transaction.id },
          reason: "Paid 100% via Bodometer Wallet balance",
        });
      } else if (chosenMethod === "SPLIT" && wallet.balance > 0 && wallet.balance < price) {
        // Split pay
        const walletUsed = wallet.balance;
        const remainingAmount = price - walletUsed;

        const { transaction } = await this._walletService.debitWallet({
          ownerId: userId,
          ownerType: WALLET_OWNER_TYPE.USER,
          amount: walletUsed,
          source: WALLET_TRANSACTION_SOURCE.BOOKING_PAYMENT,
          bookingId: booking.id,
          description: `Partial wallet payment (₹${walletUsed}) for session #${bookingNumber}`,
        });

        try {
          const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
          const checkoutResult = await this._paymentService.createCheckoutSession({
            planName: coachingService.serviceType,
            description: `Split session booking #${bookingNumber} (₹${walletUsed} Wallet + ₹${remainingAmount} Card)`,
            amount: remainingAmount,
            currency: "inr",
            successUrl: `${frontendBaseUrl}/client/booking/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${frontendBaseUrl}/client/booking/cancel?bookingId=${booking.id}`,
            metadata: {
              bookingId: booking.id,
              userId,
              trainerId: actualTrainerUserId,
              splitWalletTxId: transaction.id,
            },
          });

          checkoutUrl = checkoutResult.url;
          sessionId = checkoutResult.sessionId;
        } catch (stripeErr) {
          console.error("Stripe Checkout Initialization Error:", stripeErr);
          await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CANCELLED);
          await this._bookingRepository
            .releaseSlotHold({
              trainerId: actualTrainerUserId,
              serviceId,
              startTime: slotStart,
              holdToken,
            })
            .catch(() => undefined);
          throw new AppError(
            STATUS.INTERNAL_ERROR,
            MESSAGES.BOOKING.PAYMENT_CHECKOUT_FAILED,
          );
        }
      } else {
        // Full Online Stripe Checkout
        try {
          const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
          const checkoutResult = await this._paymentService.createCheckoutSession({
            planName: coachingService.serviceType,
            description: `Coaching session booking #${bookingNumber}`,
            amount: price,
            currency: "inr",
            successUrl: `${frontendBaseUrl}/client/booking/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${frontendBaseUrl}/client/booking/cancel?bookingId=${booking.id}`,
            metadata: {
              bookingId: booking.id,
              userId,
              trainerId: actualTrainerUserId,
            },
          });

          checkoutUrl = checkoutResult.url;
          sessionId = checkoutResult.sessionId;
        } catch (stripeErr) {
          console.error("Stripe Checkout Initialization Error:", stripeErr);
          await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CANCELLED);
          await this._bookingRepository
            .releaseSlotHold({
              trainerId: actualTrainerUserId,
              serviceId,
              startTime: slotStart,
              holdToken,
            })
            .catch(() => undefined);
          throw new AppError(
            STATUS.INTERNAL_ERROR,
            MESSAGES.BOOKING.PAYMENT_CHECKOUT_FAILED,
          );
        }
      }
    } else {
      // Free session - Auto-confirm
      await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CONFIRMED, "FREE");
      booking.status = BOOKING_STATUS.CONFIRMED;
      booking.paymentId = "FREE";

      await this._bookingRepository.confirmSlotHold({
        trainerId: actualTrainerUserId,
        serviceId,
        startTime: slotStart,
        holdToken,
        bookingId: booking.id,
      }).catch((err) => console.error("Slot hold confirm failed:", err));
    }

    return { booking, checkoutUrl, sessionId };
  }

  async verifyBookingPayment(input: VerifyPaymentInput): Promise<Booking> {
    const { bookingId, sessionId } = input;

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.BOOKING_RECORD_NOT_FOUND);
    }

    if (booking.status === BOOKING_STATUS.CONFIRMED) {
      return booking;
    }

    if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot confirm payment for a booking with status: ${booking.status}.`,
      );
    }

    if (this.isPaymentHoldExpired(booking)) {
      // Payment arrived after the hold expired — the slot may already belong
      // to another user. Do not confirm; flag for refund instead.
      await this.markPaymentFailedAndRelease(booking, sessionId);
      throw new AppError(
        STATUS.CONFLICT,
        "Payment was received after the booking hold expired and the slot was released. A refund has been initiated.",
      );
    }

    const updated = await this._bookingRepository.confirmPendingPayment(
      bookingId,
      sessionId,
    );

    if (!updated) {
      const current = await this._bookingRepository.findById(bookingId);
      if (current?.status === BOOKING_STATUS.CONFIRMED) {
        return current;
      }
      throw new AppError(
        STATUS.CONFLICT,
        "Booking is no longer awaiting payment.",
      );
    }

    // Mark the slot lock as BOOKED. If the hold was meanwhile released and
    // re-acquired by another user, this fails — the paid booking cannot be
    // fulfilled and must be refunded instead of confirmed.
    const slotToken = booking.holdToken || "";
    const slotConfirmed = slotToken
      ? await this._bookingRepository.confirmSlotHold({
        trainerId: booking.trainerId,
        serviceId: booking.serviceId,
        startTime: new Date(booking.startTime),
        holdToken: slotToken,
        bookingId: booking.id,
      })
      : false;

    if (!slotConfirmed) {
      await this.markPaymentFailedAndRelease(updated, sessionId);
      throw new AppError(
        STATUS.CONFLICT,
        "Payment was received after the slot was released to another user. A refund has been initiated.",
      );
    }

    await this._auditLogRepository.createOne({
      bookingId,
      action: AUDIT_LOG_ACTION.STATUS_CHANGED,
      performedBy: booking.userId,
      oldValue: { status: booking.status },
      newValue: { status: BOOKING_STATUS.CONFIRMED, paymentId: sessionId },
      reason: "Stripe payment verification successful",
    });

    const userDoc = await this._userRepository.findById(booking.userId);
    const trainerUserDoc = await this._userRepository.findById(booking.trainerId);
    const dateStr = new Date(booking.startTime).toLocaleDateString();
    const timeStr = new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    this._notificationService.createNotification({
      recipientId: booking.userId,
      type: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: booking.id,
      variables: {
        userName: userDoc?.name || "Client",
        trainerName: trainerUserDoc?.name || "Trainer",
        scheduledDate: dateStr,
        scheduledTime: timeStr,
      },
    }).catch((err) => console.error("Notification error:", err));

    this._notificationService.createNotification({
      recipientId: booking.trainerId,
      type: NOTIFICATION_TYPE.NEW_BOOKING_RECEIVED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: booking.id,
      variables: {
        userName: userDoc?.name || "Client",
        trainerName: trainerUserDoc?.name || "Trainer",
        serviceName: "Coaching Session",
        scheduledDate: dateStr,
        scheduledTime: timeStr,
      },
    }).catch((err) => console.error("Notification error:", err));

    return updated;
  }

  async retryPayment(bookingId: string, userId: string): Promise<{ checkoutUrl: string; sessionId: string }> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.BOOKING_RECORD_NOT_FOUND);
    }

    if (booking.userId !== userId) {
      throw new AppError(STATUS.FORBIDDEN, "You are not authorized to retry payment for this booking.");
    }

    if (booking.status !== BOOKING_STATUS.PENDING_PAYMENT) {
      throw new AppError(STATUS.BAD_REQUEST, `Cannot retry payment for a booking with status: ${booking.status}.`);
    }

    if (this.isPaymentHoldExpired(booking)) {
      await this.expireHoldAndReleaseSpot(booking);
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Payment window has expired for this booking. Please book the slot again.",
      );
    }

    const coachingService = await this._coachingRepository.getCoachingServiceById(booking.serviceId);
    const serviceName = coachingService?.serviceType || "Coaching Session";

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    try {
      const checkoutResult = await this._paymentService.createCheckoutSession({
        planName: serviceName,
        description: `Retry payment for coaching session #${booking.bookingNumber}`,
        amount: booking.price,
        currency: "inr",
        successUrl: `${frontendBaseUrl}/client/booking/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${frontendBaseUrl}/client/booking/cancel?bookingId=${booking.id}`,
        metadata: {
          bookingId: booking.id,
          userId,
          trainerId: booking.trainerId,
        },
      });

      return { checkoutUrl: checkoutResult.url, sessionId: checkoutResult.sessionId };
    } catch (stripeErr) {
      console.error("Stripe Retry Checkout Error:", stripeErr);
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.BOOKING.PAYMENT_CHECKOUT_FAILED);
    }
  }

  private async resolveTrainerUserId(trainerId: string): Promise<string> {
    const userDoc = await this._userRepository.findById(trainerId);
    if (userDoc) return trainerId;
    const profileDoc = await this._trainerProfileRepository.findById(trainerId);
    if (profileDoc && profileDoc.userId) {
      return profileDoc.userId.toString();
    }
    return trainerId;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    const bookings = await this._bookingRepository.findByUserId(userId);
    const trainerMap = new Map<string, { name?: string; email?: string }>();
    const now = Date.now();
    for (const b of bookings) {
      if (!trainerMap.has(b.trainerId)) {
        let trainerUser = await this._userRepository.findById(b.trainerId);
        if (!trainerUser) {
          const profile = await this._trainerProfileRepository.findById(b.trainerId);
          if (profile && profile.userId) {
            trainerUser = await this._userRepository.findById(profile.userId.toString());
          }
        }
        if (trainerUser) {
          trainerMap.set(b.trainerId, { name: trainerUser.name, email: trainerUser.email });
        }
      }
      const tInfo = trainerMap.get(b.trainerId);
      if (tInfo) {
        b.trainerName = tInfo.name;
        b.trainerEmail = tInfo.email;
      }

      const startMs = new Date(b.startTime).getTime();
      const endMs = new Date(b.endTime).getTime();
      const callAvailableMs = startMs - 5 * 60 * 1000;
      b.callAvailableAt = new Date(callAvailableMs).toISOString();

      if (
        b.status === BOOKING_STATUS.COMPLETED ||
        b.status === BOOKING_STATUS.CANCELLED ||
        b.status === BOOKING_STATUS.NO_SHOW ||
        b.status === BOOKING_STATUS.EXPIRED ||
        now >= endMs
      ) {
        b.sessionPhase = "ENDED";
      } else if (now >= callAvailableMs && now < endMs) {
        b.sessionPhase = "CALL_AVAILABLE";
      } else {
        b.sessionPhase = "UPCOMING";
      }

      b.cancellationDetails = await this._cancellationRepository.findByBookingId(b.id);
      b.rescheduleRequest = await this._rescheduleRepository.findPendingByBookingId(b.id);
    }
    return bookings;
  }

  async getTrainerBookings(trainerId: string): Promise<Booking[]> {
    const actualTrainerId = await this.resolveTrainerUserId(trainerId);
    const bookings = await this._bookingRepository.findByTrainerId(actualTrainerId);

    const userMap = new Map<string, { name?: string; email?: string }>();
    for (const b of bookings) {
      if (!userMap.has(b.userId)) {
        const u = await this._userRepository.findById(b.userId);
        if (u) userMap.set(b.userId, { name: u.name, email: u.email });
      }
      const uInfo = userMap.get(b.userId);
      if (uInfo) {
        b.userName = uInfo.name;
        b.userEmail = uInfo.email;
      }
    }

    return bookings;
  }

  async getBookingById(bookingId: string): Promise<Booking | null> {
    return this._bookingRepository.findById(bookingId);
  }

  async cancelBooking(bookingId: string, userId: string, reason?: string): Promise<Booking> {
    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.BOOKING_NOT_FOUND);
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      return booking;
    }

    const previousStatus = booking.status;

    const updated = await this._bookingRepository.updateById(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancellation: {
        cancelledBy: userId,
        reason: reason || MESSAGES.CANCELLATION.DEFAULT_USER_REASON,
        cancelledAt: new Date(),
      },
    });

    if (!updated) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.BOOKING.FAILED_TO_CANCEL);
    }

    await this._auditLogRepository.createOne({
      bookingId,
      action: AUDIT_LOG_ACTION.CANCELLED,
      performedBy: userId,
      oldValue: { status: booking.status },
      newValue: { status: BOOKING_STATUS.CANCELLED, reason },
    });

    if (
      previousStatus === BOOKING_STATUS.PENDING_PAYMENT ||
      previousStatus === BOOKING_STATUS.CONFIRMED ||
      previousStatus === BOOKING_STATUS.RESCHEDULE_PENDING
    ) {
      await this._bookingRepository
        .releaseSlotHold({
          trainerId: booking.trainerId,
          serviceId: booking.serviceId,
          startTime: new Date(booking.startTime),
          holdToken: booking.holdToken,
          bookingId: booking.id,
        })
        .catch((err) => console.error("Failed to release slot hold on cancel:", err));
    }

    return updated;
  }

  private isPaymentHoldExpired(booking: Booking): boolean {
    const expiryMs = booking.holdExpiresAt
      ? new Date(booking.holdExpiresAt).getTime()
      : booking.createdAt
        ? new Date(booking.createdAt).getTime() + SLOT_HOLD_MS
        : 0;
    return expiryMs > 0 && Date.now() > expiryMs;
  }

  private async expireHoldAndReleaseSpot(booking: Booking): Promise<void> {
    await this._bookingRepository.expirePendingBooking(booking.id);
    await this._bookingRepository
      .releaseSlotHold({
        trainerId: booking.trainerId,
        serviceId: booking.serviceId,
        startTime: new Date(booking.startTime),
        holdToken: booking.holdToken,
        bookingId: booking.id,
      })
      .catch((err) => console.error("Failed to release slot hold on expiry:", err));
  }

  private async markPaymentFailedAndRelease(
    booking: Booking,
    paymentId?: string,
  ): Promise<void> {
    await this._bookingRepository.updateById(booking.id, {
      status: BOOKING_STATUS.PAYMENT_FAILED,
      ...(paymentId ? { paymentId } : {}),
    });

    await this._bookingRepository
      .releaseSlotHold({
        trainerId: booking.trainerId,
        serviceId: booking.serviceId,
        startTime: new Date(booking.startTime),
        holdToken: booking.holdToken,
        bookingId: booking.id,
      })
      .catch((err) => console.error("Failed to release slot hold on payment failure:", err));

    await this._auditLogRepository.createOne({
      bookingId: booking.id,
      action: AUDIT_LOG_ACTION.STATUS_CHANGED,
      performedBy: booking.userId,
      oldValue: { status: booking.status },
      newValue: { status: BOOKING_STATUS.PAYMENT_FAILED, paymentId },
      reason: "Payment received after the booking hold expired; refund initiated",
    }).catch((err) => console.error("Audit log error:", err));

    if (booking.price > 0) {
      try {
        const refund = await this._refundService.createRefundRecord({
          bookingId: booking.id,
          paymentId: paymentId || booking.paymentId,
          userId: booking.userId,
          trainerId: booking.trainerId,
          amount: booking.price,
          currency: "inr",
          reason: "Late payment received after slot hold expired",
          triggeredBy: "SYSTEM",
        });
        // processRefund looks up the refund by bookingId internally
        await this._refundService.processRefund(booking.id).catch((err) =>
          console.error("Refund processing error:", err),
        );
        void refund;
      } catch (err) {
        console.error("Failed to create refund record for late payment:", err);
      }
    }
  }

  async handleBookingPaymentWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event;
    try {
      event = this._paymentService.constructWebhookEvent(rawBody, signature);
    } catch {
      throw new AppError(STATUS.BAD_REQUEST, "Invalid Stripe webhook signature.");
    }

    if (event.type !== "checkout.session.completed") {
      return;
    }

    const session = event.data as {
      id?: string;
      payment_status?: string;
      amount_total?: number;
      currency?: string;
      metadata?: Record<string, string>;
    };

    if (session.payment_status !== "paid") {
      return;
    }

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) {
      console.warn("Stripe webhook missing bookingId metadata");
      return;
    }

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      console.warn(`Stripe webhook for unknown booking ${bookingId}`);
      return;
    }

    // Verify amount and currency match the booking before confirming
    if (session.amount_total !== undefined) {
      const expectedCents = Math.round(Number(booking.price) * 100);
      if (session.amount_total !== expectedCents) {
        console.warn(
          `Stripe webhook amount mismatch for booking ${bookingId}: got ${session.amount_total}, expected ${expectedCents}`,
        );
        return;
      }
    }
    if (session.currency && session.currency !== "inr") {
      console.warn(`Stripe webhook currency mismatch for booking ${bookingId}: ${session.currency}`);
      return;
    }

    try {
      await this.verifyBookingPayment({ bookingId, sessionId: session.id || "" });
    } catch (err) {
      // Expired/reassigned holds are already handled inside verifyBookingPayment
      // (booking marked PAYMENT_FAILED + refund created). Log and ack so Stripe
      // does not retry a permanently unfulfillable payment.
      console.warn(`Booking webhook could not confirm booking ${bookingId}:`, err);
    }
  }

  async expireStalePendingBookings(): Promise<number> {
    const cutoff = new Date(Date.now() - SLOT_HOLD_MS);
    const staleBookings = await this._bookingRepository.findStalePendingPayments(cutoff);

    let expiredCount = 0;
    for (const booking of staleBookings) {
      if (booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() > Date.now()) {
        continue;
      }
      const expired = await this._bookingRepository.expirePendingBooking(booking.id);
      if (!expired) continue;

      await this._bookingRepository
        .releaseSlotHold({
          trainerId: booking.trainerId,
          serviceId: booking.serviceId,
          startTime: new Date(booking.startTime),
          holdToken: booking.holdToken,
          bookingId: booking.id,
        })
        .catch((err) => console.error("Failed to release slot hold on expiry:", err));

      expiredCount += 1;
    }

    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} stale pending-payment booking(s).`);
    }

    return expiredCount;
  }
}
