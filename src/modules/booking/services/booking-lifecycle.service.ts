import { inject, injectable } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { USER_TYPES } from "@/modules/user/user.types";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { COACHING_TYPES } from "@/modules/coaching/coaching.types";

import { IBookingRepository } from "../interface/repository.interface/booking-repository.interface";
import { IBookingAuditLogRepository } from "../interface/repository.interface/booking-audit-log-repository.interface";
import { IBookingCancellationRepository } from "../repositories/booking-cancellation.repository";
import { IBookingRescheduleRequestRepository } from "../repositories/booking-reschedule-request.repository";
import { IBookingRefundRepository } from "../repositories/booking-refund.repository";
import { IBookingSlotEngineService } from "../interface/service.interface/booking-slot-engine-service.interface";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";
import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { ICoachingRepository } from "@/modules/coaching/interface/coaching-repository.interface";

import { Booking,} from "../interface/domain/booking.interface";
import { BookingCancellation } from "../interface/domain/booking-cancellation.interface";
import { BookingRescheduleRequest } from "../interface/domain/booking-reschedule-request.interface";
import { BookingRefund } from "../interface/domain/booking-refund.interface";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import {
  AUDIT_LOG_ACTION,
  BOOKING_STATUS,

  RESCHEDULE_STATUS,
} from "@/constants/constant.values.ts/booking.constant";

import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import { NOTIFICATION_ENTITY_TYPE, NOTIFICATION_TYPE } from "@/modules/notification/constant/notification.constant";

export interface CancelBookingInput {
  bookingId: string;
  cancelledByUserId: string;
  isTrainer: boolean;
  reason: string;
  reasonCode?: string;
}

export interface UserRescheduleInput {
  bookingId: string;
  userId: string;
  newStartTime: string;
  newEndTime: string;
  newBufferEndTime: string;
}

export interface TrainerProposeRescheduleInput {
  bookingId: string;
  trainerId: string;
  proposedStartTime: string;
  proposedEndTime: string;
  proposedBufferEndTime: string;
  reason: string;
}

export interface RespondRescheduleInput {
  requestId: string;
  userId: string;
  accept: boolean;
  reason?: string;
}

export interface EnrichedBooking extends Booking {
  userName?: string;
  userEmail?: string;
  serviceName?: string;
  serviceDuration?: number;
  cancellationDetails?: BookingCancellation | null;
  rescheduleRequest?: BookingRescheduleRequest | null;
}

export interface IBookingLifecycleService {
  cancelBooking(input: CancelBookingInput): Promise<{ booking: Booking; cancellation: BookingCancellation; refund?: BookingRefund }>;
  rescheduleBookingByUser(input: UserRescheduleInput): Promise<Booking>;
  proposeRescheduleByTrainer(input: TrainerProposeRescheduleInput): Promise<BookingRescheduleRequest>;
  respondToRescheduleRequest(input: RespondRescheduleInput): Promise<{ request: BookingRescheduleRequest; booking: Booking }>;
  getTrainerBookings(trainerId: string, filter?: "upcoming" | "history" | "all"): Promise<EnrichedBooking[]>;
  getUserPendingRescheduleRequests(userId: string): Promise<{ request: BookingRescheduleRequest; booking: Booking }[]>;
}

@injectable()
export class BookingLifecycleService implements IBookingLifecycleService {
  constructor(
    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(BOOKING_TYPES.BookingAuditLogRepository)
    private _auditLogRepository: IBookingAuditLogRepository,

    @inject(BOOKING_TYPES.BookingCancellationRepository)
    private _cancellationRepository: IBookingCancellationRepository,

    @inject(BOOKING_TYPES.BookingRescheduleRequestRepository)
    private _rescheduleRepository: IBookingRescheduleRequestRepository,

    @inject(BOOKING_TYPES.BookingRefundRepository)
    private _refundRepository: IBookingRefundRepository,

    @inject(BOOKING_TYPES.BookingSlotEngineService)
    private _slotEngineService: IBookingSlotEngineService,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,

    @inject(COACHING_TYPES.CoachingRepository)
    private _coachingRepository: ICoachingRepository,

    @inject(NOTIFICATION_TYPES.NotificationService)
    private _notificationService: INotificationService,
  ) {}

  private async resolveUserId(id: string): Promise<string> {
    const userDoc = await this._userRepository.findById(id);
    if (userDoc) return id;

    const profileDoc = await this._trainerProfileRepository.findById(id);
    if (profileDoc && profileDoc.userId) {
      return profileDoc.userId.toString();
    }
    return id;
  }

  async cancelBooking(
    input: CancelBookingInput,
  ): Promise<{ booking: Booking; cancellation: BookingCancellation; refund?: BookingRefund }> {
    const { bookingId, cancelledByUserId, isTrainer, reason, reasonCode } = input;

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, "Booking session not found.");
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.ALREADY_CANCELLED);
    }
    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.CANCELLATION.CANNOT_CANCEL_COMPLETED);
    }

    const actualActorId = await this.resolveUserId(cancelledByUserId);
    const actorType = isTrainer ? "TRAINER" : "USER";

    let refundPercentage = 0;
    let policyName = "";
    let hoursNotice = 0;

    if (isTrainer) {
      policyName = "TRAINER_CANCELLATION_FULL_REFUND";
      refundPercentage = 100;
      hoursNotice = Math.max(0, (new Date(booking.startTime).getTime() - Date.now()) / (3600 * 1000));
    } else {
      const nowMs = Date.now();
      const startMs = new Date(booking.startTime).getTime();
      hoursNotice = (startMs - nowMs) / (3600 * 1000);

      if (hoursNotice >= 24) {
        refundPercentage = 100;
        policyName = "USER_CANCEL_ADVANCE_24H_PLUS";
      } else if (hoursNotice >= 6) {
        refundPercentage = 50;
        policyName = "USER_CANCEL_STANDARD_6H_TO_24H";
      } else {
        refundPercentage = 0;
        policyName = "USER_CANCEL_LATE_UNDER_6H";
      }
    }

    const refundAmount = (booking.price * refundPercentage) / 100;
    const refundEligible = refundAmount > 0;

    const cancellation = await this._cancellationRepository.createOne({
      bookingId: booking.id,
      cancelledBy: actorType,
      cancelledByUserId: actualActorId,
      reasonCode: reasonCode || "GENERAL",
      reason: reason || (isTrainer ? MESSAGES.CANCELLATION.DEFAULT_TRAINER_REASON : MESSAGES.CANCELLATION.DEFAULT_USER_REQUEST_REASON),
      cancelledAt: new Date(),
      refundEligible,
      refundPercentage,
      refundAmount,
      policySnapshot: {
        policyName,
        hoursNotice: Math.round(hoursNotice * 10) / 10,
        refundPercentage,
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
        reason: `Refund for cancellation (${policyName})`,
        triggeredBy: actorType,
        status: "PENDING",
      });
    }

    const updatedBooking = await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CANCELLED);

    await this._auditLogRepository.createOne({
      bookingId: booking.id,
      action: AUDIT_LOG_ACTION.CANCELLED,
      performedBy: actualActorId,
      oldValue: { status: booking.status },
      newValue: { status: BOOKING_STATUS.CANCELLED, refundPercentage, refundAmount },
    });

    const userDoc = await this._userRepository.findById(booking.userId);
    const trainerUserDoc = await this._userRepository.findById(booking.trainerId);
    const scheduledDateStr = new Date(booking.startTime).toLocaleDateString();
    const scheduledTimeStr = new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this._notificationService.createNotification({
      recipientId: booking.userId,
      type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: booking.id,
      variables: {
        userName: userDoc?.name || "Client",
        trainerName: trainerUserDoc?.name || "Trainer",
        scheduledDate: scheduledDateStr,
        scheduledTime: scheduledTimeStr,
      },
    }).catch((err) => console.error("Notification error:", err));

    this._notificationService.createNotification({
      recipientId: booking.trainerId,
      type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: booking.id,
      variables: {
        userName: userDoc?.name || "Client",
        trainerName: trainerUserDoc?.name || "Trainer",
        scheduledDate: scheduledDateStr,
        scheduledTime: scheduledTimeStr,
      },
    }).catch((err) => console.error("Notification error:", err));

    return {
      booking: updatedBooking || booking,
      cancellation,
      refund,
    };
  }

  async rescheduleBookingByUser(input: UserRescheduleInput): Promise<Booking> {
    const { bookingId, userId, newStartTime, newEndTime, newBufferEndTime } = input;

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.CANCELLATION.SESSION_NOT_FOUND);
    }
    if (booking.userId !== userId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.RESCHEDULE.UNAUTHORIZED_RESPOND);
    }

    const availableSlots = await this._slotEngineService.calculateAvailableSlots({
      trainerId: booking.trainerId,
      serviceId: booking.serviceId,
      date: newStartTime,
    });

    const startIso = new Date(newStartTime).toISOString();
    const isAvailable = availableSlots.some((s) => s.startTime === startIso);

    if (!isAvailable) {
      throw new AppError(STATUS.CONFLICT, MESSAGES.BOOKING.SLOT_UNAVAILABLE);
    }

    const updatedBooking = await this._bookingRepository.updateTimes(
      booking.id,
      new Date(newStartTime),
      new Date(newEndTime),
      new Date(newBufferEndTime),
      new Date(newStartTime),
      BOOKING_STATUS.CONFIRMED,
    );

    await this._auditLogRepository.createOne({
      bookingId: booking.id,
      action: AUDIT_LOG_ACTION.RESCHEDULED,
      performedBy: userId,
      oldValue: { startTime: booking.startTime, endTime: booking.endTime },
      newValue: { startTime: newStartTime, endTime: newEndTime },
    });

    const userDoc = await this._userRepository.findById(booking.userId);
    const trainerUserDoc = await this._userRepository.findById(booking.trainerId);

    this._notificationService.createNotification({
      recipientId: booking.trainerId,
      type: NOTIFICATION_TYPE.RESCHEDULE_REQUEST_RECEIVED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: booking.id,
      variables: {
        userName: userDoc?.name || "Client",
        trainerName: trainerUserDoc?.name || "Trainer",
        oldDate: new Date(booking.startTime).toLocaleDateString(),
        oldTime: new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        newDate: new Date(newStartTime).toLocaleDateString(),
        newTime: new Date(newStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    }).catch((err) => console.error("Notification error:", err));

    return updatedBooking || booking;
  }

  async proposeRescheduleByTrainer(
    input: TrainerProposeRescheduleInput,
  ): Promise<BookingRescheduleRequest> {
    const { bookingId, trainerId, proposedStartTime, proposedEndTime, proposedBufferEndTime, reason } = input;
    const actualTrainerId = await this.resolveUserId(trainerId);

    const booking = await this._bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.CANCELLATION.SESSION_NOT_FOUND);
    }
    if (booking.trainerId !== actualTrainerId) {
      throw new AppError(STATUS.FORBIDDEN, MESSAGES.RESCHEDULE.UNAUTHORIZED_PROPOSE);
    }

    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);

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

    await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.RESCHEDULE_PENDING);

    await this._auditLogRepository.createOne({
      bookingId: booking.id,
      action: AUDIT_LOG_ACTION.STATUS_CHANGED,
      performedBy: actualTrainerId,
      oldValue: { status: booking.status },
      newValue: { status: BOOKING_STATUS.RESCHEDULE_PENDING, requestId: request.id },
    });

    const userDoc = await this._userRepository.findById(booking.userId);
    const trainerUserDoc = await this._userRepository.findById(booking.trainerId);

    this._notificationService.createNotification({
      recipientId: booking.userId,
      type: NOTIFICATION_TYPE.RESCHEDULE_PROPOSED,
      entityType: NOTIFICATION_ENTITY_TYPE.RESCHEDULE_REQUEST,
      entityId: request.id,
      variables: {
        userName: userDoc?.name || "Client",
        trainerName: trainerUserDoc?.name || "Trainer",
        oldDate: new Date(booking.startTime).toLocaleDateString(),
        oldTime: new Date(booking.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        newDate: new Date(proposedStartTime).toLocaleDateString(),
        newTime: new Date(proposedStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    }).catch((err) => console.error("Notification error:", err));

    return request;
  }

  async respondToRescheduleRequest(
    input: RespondRescheduleInput,
  ): Promise<{ request: BookingRescheduleRequest; booking: Booking }> {
    const { requestId, userId, accept, reason } = input;

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

    const userDoc = await this._userRepository.findById(booking.userId);
    const trainerUserDoc = await this._userRepository.findById(booking.trainerId);

    if (accept) {
      const availableSlots = await this._slotEngineService.calculateAvailableSlots({
        trainerId: booking.trainerId,
        serviceId: booking.serviceId,
        date: request.proposedStartTime.toISOString(),
      });

      const startIso = new Date(request.proposedStartTime).toISOString();
      const isAvailable = availableSlots.some((s) => s.startTime === startIso);

      if (!isAvailable) {
        throw new AppError(STATUS.CONFLICT, MESSAGES.RESCHEDULE.RESCHEDULE_CONFLICT);
      }

      const updatedBooking = await this._bookingRepository.updateTimes(
        booking.id,
        request.proposedStartTime,
        request.proposedEndTime,
        request.proposedBufferEndTime,
        request.proposedStartTime,
        BOOKING_STATUS.CONFIRMED,
      );

      const updatedRequest = await this._rescheduleRepository.updateStatus(request.id, RESCHEDULE_STATUS.ACCEPTED, reason);

      this._notificationService.createNotification({
        recipientId: booking.trainerId,
        type: NOTIFICATION_TYPE.RESCHEDULE_ACCEPTED,
        entityType: NOTIFICATION_ENTITY_TYPE.RESCHEDULE_REQUEST,
        entityId: request.id,
        variables: {
          userName: userDoc?.name || "Client",
          trainerName: trainerUserDoc?.name || "Trainer",
          scheduledDate: new Date(request.proposedStartTime).toLocaleDateString(),
          scheduledTime: new Date(request.proposedStartTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      }).catch((err) => console.error("Notification error:", err));

      return { request: updatedRequest || request, booking: updatedBooking || booking };
    } else {
      const updatedBooking = await this._bookingRepository.updateStatus(booking.id, BOOKING_STATUS.CONFIRMED);
      const updatedRequest = await this._rescheduleRepository.updateStatus(request.id, RESCHEDULE_STATUS.REJECTED, reason);

      this._notificationService.createNotification({
        recipientId: booking.trainerId,
        type: NOTIFICATION_TYPE.RESCHEDULE_REJECTED,
        entityType: NOTIFICATION_ENTITY_TYPE.RESCHEDULE_REQUEST,
        entityId: request.id,
        variables: {
          userName: userDoc?.name || "Client",
          trainerName: trainerUserDoc?.name || "Trainer",
        },
      }).catch((err) => console.error("Notification error:", err));

      return { request: updatedRequest || request, booking: updatedBooking || booking };
    }
  }

  async getTrainerBookings(
    trainerId: string,
    filter: "upcoming" | "history" | "all" = "all",
  ): Promise<EnrichedBooking[]> {
    const actualTrainerId = await this.resolveUserId(trainerId);
    const bookings = await this._bookingRepository.findByTrainerId(actualTrainerId);

    const now = new Date();

    const enriched: EnrichedBooking[] = await Promise.all(
      bookings.map(async (b) => {
        const user = await this._userRepository.findById(b.userId);
        const coaching = await this._coachingRepository.getCoachingServiceById(b.serviceId);
        const cancellationDetails = await this._cancellationRepository.findByBookingId(b.id);
        const rescheduleRequest = await this._rescheduleRepository.findPendingByBookingId(b.id);

        return {
          ...b,
          userName: user?.name || "Client",
          userEmail: user?.email || "",
          serviceName: coaching?.serviceType || "Coaching Session",
          serviceDuration: coaching?.durationMinutes || 60,
          cancellationDetails,
          rescheduleRequest,
        };
      }),
    );

    if (filter === "upcoming") {
      return enriched.filter(
        (b) =>
          (b.status === BOOKING_STATUS.CONFIRMED || b.status === BOOKING_STATUS.RESCHEDULE_PENDING || b.status === BOOKING_STATUS.PENDING_PAYMENT) &&
          new Date(b.startTime) >= now,
      );
    }

    if (filter === "history") {
      return enriched.filter(
        (b) =>
          b.status === BOOKING_STATUS.COMPLETED ||
          b.status === BOOKING_STATUS.CANCELLED ||
          b.status === BOOKING_STATUS.NO_SHOW ||
          new Date(b.startTime) < now,
      );
    }

    return enriched;
  }

  async getUserPendingRescheduleRequests(
    userId: string,
  ): Promise<{ request: BookingRescheduleRequest; booking: Booking }[]> {
    const userBookings = await this._bookingRepository.findByUserId(userId);
    const result: { request: BookingRescheduleRequest; booking: Booking }[] = [];

    for (const b of userBookings) {
      const pendingReq = await this._rescheduleRepository.findPendingByBookingId(b.id);
      if (pendingReq) {
        result.push({ request: pendingReq, booking: b });
      }
    }

    return result;
  }
}
