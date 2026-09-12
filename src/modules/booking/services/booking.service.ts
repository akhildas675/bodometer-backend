import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { BOOKING_TYPES } from "../booking.types";
import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { COACHING_TYPES } from "@/modules/coaching/coaching.types";
import { USER_TYPES } from "@/modules/user/user.types";

import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { IBookingAuditLogRepository } from "../interface/repository.interface/booking-audit-log-repository.interface";
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
import { AUDIT_LOG_ACTION, BOOKING_STATUS } from "@/constants/constant.values.ts/booking.constant";

function generateBookingNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK-${dateStr}-${rand}`;
}

import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { WALLET_TYPES } from "@/modules/wallet/wallet.types";
import { IWalletService } from "@/modules/wallet/services/wallet.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

import { IUserSubscriptionRepository } from "@/modules/subscription/interface/repository.interface/user.subscription.repository.interface";

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
  ) {}

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

    // 3. Create Booking Document (Status: PENDING)
    const booking = await this._bookingRepository.createOne({
      bookingNumber,
      trainerId: actualTrainerUserId,
      userId,
      serviceId,
      bookingDate: new Date(bookingDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      bufferEndTime: new Date(bufferEndTime),
      status: BOOKING_STATUS.PENDING_PAYMENT,
      price,
      attendance: { status: "PENDING" },
    });

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
      const wallet = await this._walletService.getOrCreateWallet(userId);
      const chosenMethod = input.paymentMethod || (wallet.balance >= price ? "WALLET" : "ONLINE");

      if (chosenMethod === "WALLET") {
        if (wallet.balance < price) {
          throw new AppError(
            STATUS.BAD_REQUEST,
            `Insufficient wallet balance (Available: ₹${wallet.balance}, Required: ₹${price}). Please add funds or select Online Payment.`,
          );
        }

        const { transaction } = await this._walletService.debitWallet({
          userId,
          amount: price,
          source: "BOOKING_PAYMENT",
          bookingId: booking.id,
          description: `Wallet payment for coaching session #${bookingNumber}`,
        });

        await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CONFIRMED, transaction.id);
        booking.status = BOOKING_STATUS.CONFIRMED;
        booking.paymentId = transaction.id;

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
          userId,
          amount: walletUsed,
          source: "BOOKING_PAYMENT",
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

    const updated = await this._bookingRepository.updateStatus(
      bookingId,
      BOOKING_STATUS.CONFIRMED,
      sessionId,
    );

    if (!updated) {
      throw new AppError(STATUS.INTERNAL_ERROR, MESSAGES.BOOKING.FAILED_TO_CONFIRM);
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

    const updated = await this._bookingRepository.updateById(bookingId, {
      status: BOOKING_STATUS.CANCELLED,
      cancellation: {
        cancelledBy: new mongoose.Types.ObjectId(userId),
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

    return updated;
  }
}
