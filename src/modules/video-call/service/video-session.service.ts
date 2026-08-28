import { inject, injectable } from "inversify";

import { VideoSessionResponseDto } from "../dto/video-session.dto";

import { VideoSessionMapper } from "../mapper/video-session.mapper";

import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { IVideoSessionService } from "../interface/video.session-service.interface";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { VIDEO_CALL_TYPES } from "../video-call.types";
import { IBookingRepository } from "@/modules/booking/interface/repository.interface/booking-repository.interface";
import { BOOKING_TYPES } from "@/modules/booking/booking.types";
import {
  VIDEO_SESSION_STATUS,
  VIDEO_SESSION_TERMINATION_REASON,
  VideoSessionTerminationReason,
} from "../constant/video-session.constant";

import { WALLET_TYPES } from "@/modules/wallet/wallet.types";
import { IWalletService } from "@/modules/wallet/services/wallet.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_TYPE,
} from "@/modules/notification/constant/notification.constant";

@injectable()
export default class VideoSessionService implements IVideoSessionService {
  constructor(
    @inject(VIDEO_CALL_TYPES.Repository)
    private readonly _videoSessionRepository: IVideoSessionRepository,
    @inject(BOOKING_TYPES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,
    @inject(WALLET_TYPES.WalletService)
    private readonly _walletService: IWalletService,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly _notificationService: INotificationService,
  ) { }

  async getVideoSession(
    bookingId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getByBookingId(bookingId);

    if (!session) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.VIDEO_SESSION.NOT_FOUND);
    }

    if (session.trainerId !== userId && session.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_ACCESS,
      );
    }

    return VideoSessionMapper.toResponse(session);
  }

  async requestCall(
    bookingId: string,
    trainerId: string,
  ): Promise<VideoSessionResponseDto> {
    const booking = await this._bookingRepository.findById(bookingId);

    if (!booking) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.VIDEO_SESSION.BOOKING_NOT_FOUND);
    }

    if (booking.trainerId !== trainerId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_START,
      );
    }

    if (booking.status !== "CONFIRMED") {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VIDEO_SESSION.BOOKING_NOT_CONFIRMED);
    }

    const existingSession =
      await this._videoSessionRepository.getByBookingId(bookingId);

    if (existingSession) {
      if (existingSession.status === VIDEO_SESSION_STATUS.WAITING) {
        const updated = await this._videoSessionRepository.updateVideoSession(
          existingSession.id,
          { $set: { trainerStartRequestedAt: new Date() } },
        );
        return VideoSessionMapper.toResponse(updated || existingSession);
      }
      throw new AppError(
        STATUS.CONFLICT,
        MESSAGES.VIDEO_SESSION.ALREADY_EXISTS,
      );
    }

    const now = new Date();

    if (now.getTime() < booking.startTime.getTime()) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VIDEO_SESSION.SESSION_NOT_STARTED_YET);
    }

    const trainerStartDeadline = new Date(
      booking.startTime.getTime() + 10 * 60 * 1000,
    );

    if (now.getTime() > trainerStartDeadline.getTime()) {
      // Trainer missed start window – mark session as EXPIRED
      await this._videoSessionRepository.createVideoSession({
        bookingId: booking.id,
        trainerId: booking.trainerId,
        userId: booking.userId,
        scheduledStartTime: booking.startTime,
        scheduledEndTime: booking.endTime,
        status: VIDEO_SESSION_STATUS.EXPIRED,
        terminationReason: VIDEO_SESSION_TERMINATION_REASON.TRAINER_NO_SHOW,
        actualEndTime: now,
      });

      // Mark booking as CANCELLED
      await this._bookingRepository.updateStatus(booking.id, "CANCELLED");

      // Process 100% refund due to trainer no‑show
      if (booking.price && booking.price > 0) {
        await this._walletService.creditWallet({
          userId: booking.userId,
          amount: booking.price,
          source: "BOOKING_REFUND",
          bookingId: booking.id,
          description: `100% refund due to trainer no‑show for session #${booking.bookingNumber || booking.id}`,
        });
        await this._notificationService.createNotification({
          recipientId: booking.userId,
          type: NOTIFICATION_TYPE.REFUND_PROCESSED,
          entityType: NOTIFICATION_ENTITY_TYPE.REFUND,
          entityId: booking.id,
          variables: { amount: booking.price, currency: "INR" },
        });
      }
      // Notify both parties about cancellation
      await this._notificationService.createNotification({
        recipientId: booking.trainerId,
        type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
        entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
        entityId: booking.id,
      });
      await this._notificationService.createNotification({
        recipientId: booking.userId,
        type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
        entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
        entityId: booking.id,
      });

      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.START_WINDOW_EXPIRED,
      );
    }

    const session = await this._videoSessionRepository.createVideoSession({
      bookingId: booking.id,

      trainerId: booking.trainerId,

      userId: booking.userId,

      scheduledStartTime: booking.startTime,

      scheduledEndTime: booking.endTime,

      trainerStartRequestedAt: now,

      status: VIDEO_SESSION_STATUS.WAITING,
    });

    return VideoSessionMapper.toResponse(session);
  }

  async acceptCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getById(
        videoSessionId,
      );

    if (!session) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    if (session.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_ACCEPT,
      );
    }

    if (
      session.status !== VIDEO_SESSION_STATUS.WAITING
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.NOT_WAITING,
      );
    }

    if (!session.trainerStartRequestedAt) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.REQUEST_TIME_MISSING,
      );
    }

    const now = new Date();


    if (now > session.scheduledEndTime) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.ACCEPTANCE_WINDOW_EXPIRED,
      );
    }

    const updatedSession =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          $set: {
            userAcceptedAt: now,
            status: "ACCEPTED",
          },
        },
      );

    if (!updatedSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_ACCEPT,
      );
    }

    return VideoSessionMapper.toResponse(
      updatedSession,
    );
  }

  async rejectCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getById(
        videoSessionId,
      );

    if (!session) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    if (session.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_REJECT,
      );
    }

    if (
      session.status !== VIDEO_SESSION_STATUS.WAITING
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.CANNOT_REJECT_STATE,
      );
    }

    const now = new Date();

    const updatedSession =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          $set: {
            status: VIDEO_SESSION_STATUS.CANCELLED,

            terminationReason:
              VIDEO_SESSION_TERMINATION_REASON.USER_REJECTED,

            actualEndTime: now,
          },
        },
      );

    if (!updatedSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_REJECT,
      );
    }

    // Mark cancelled
    await this._bookingRepository.updateStatus(session.bookingId, "CANCELLED");

    //50% refund 
    const booking = await this._bookingRepository.findById(session.bookingId);
    let refundAmount = 0;
    if (booking && booking.price) {
      refundAmount = (booking.price * 50) / 100;
      if (refundAmount > 0) {
        await this._walletService.creditWallet({
          userId: session.userId,
          amount: refundAmount,
          source: "BOOKING_REFUND",
          bookingId: session.bookingId,
          description: `50% refund for rejected video session #${booking.bookingNumber || session.bookingId}`,
        });

        // Refund Processed 
        await this._notificationService.createNotification({
          recipientId: session.userId,
          type: NOTIFICATION_TYPE.REFUND_PROCESSED,
          entityType: NOTIFICATION_ENTITY_TYPE.REFUND,
          entityId: session.bookingId,
          variables: { amount: refundAmount, currency: "INR" },
        });
      }
    }

    //  Send Booking Cancelled 
    await this._notificationService.createNotification({
      recipientId: session.trainerId,
      type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: session.bookingId,
    });

    await this._notificationService.createNotification({
      recipientId: session.userId,
      type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
      entityType: NOTIFICATION_ENTITY_TYPE.BOOKING,
      entityId: session.bookingId,
    });

    return VideoSessionMapper.toResponse(
      updatedSession,
    );
  }

  async joinSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getById(
        videoSessionId,
      );

    if (!session) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    const isTrainer =
      session.trainerId === participantId;

    const isUser =
      session.userId === participantId;

    if (!isTrainer && !isUser) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_PARTICIPANT,
      );
    }

    if (
      session.status !== VIDEO_SESSION_STATUS.ACCEPTED &&
      session.status !== VIDEO_SESSION_STATUS.ACTIVE
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.CANNOT_JOIN_STATE,
      );
    }

    const now = new Date();

    const update: Record<string, unknown> = {};

    if (isTrainer && !session.trainerJoinedAt) {
      update.trainerJoinedAt = now;
    }

    if (isUser && !session.userJoinedAt) {
      update.userJoinedAt = now;
    }

    const trainerJoined =
      isTrainer || !!session.trainerJoinedAt;

    const userJoined =
      isUser || !!session.userJoinedAt;

    if (trainerJoined && userJoined) {
      update.status = VIDEO_SESSION_STATUS.ACTIVE;

      if (!session.actualStartTime) {
        update.actualStartTime = now;
      }
    }

    const updatedSession =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          $set: update,
        },
      );

    if (!updatedSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_JOIN,
      );
    }

    return VideoSessionMapper.toResponse(
      updatedSession,
    );
  }

  async leaveSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getById(
        videoSessionId,
      );

    if (!session) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    const isTrainer =
      session.trainerId === participantId;

    const isUser =
      session.userId === participantId;

    if (!isTrainer && !isUser) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_PARTICIPANT,
      );
    }

    if (
      session.status !== VIDEO_SESSION_STATUS.ACTIVE
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.NOT_ACTIVE,
      );
    }

    const now = new Date();

    const update: Record<string, unknown> = {};

    if (isTrainer) {
      update.trainerLeftAt = now;
    }

    if (isUser) {
      update.userLeftAt = now;
    }

    const updatedSession =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          $set: update,
        },
      );

    if (!updatedSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_UPDATE,
      );
    }

    return VideoSessionMapper.toResponse(
      updatedSession,
    );
  }

  async endSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getById(
        videoSessionId,
      );

    if (!session) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    const isTrainer =
      session.trainerId === participantId;

    const isUser =
      session.userId === participantId;

    if (!isTrainer && !isUser) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_PARTICIPANT,
      );
    }

    if (
      session.status !== VIDEO_SESSION_STATUS.ACTIVE
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.NOT_ACTIVE,
      );
    }

    const now = new Date();

    let terminationReason:
      | VideoSessionTerminationReason
      | undefined;

    if (
      now.getTime() >=
      session.scheduledEndTime.getTime()
    ) {
      terminationReason =
        VIDEO_SESSION_TERMINATION_REASON.SCHEDULE_ENDED;
    } else if (isTrainer) {
      terminationReason =
        VIDEO_SESSION_TERMINATION_REASON.TRAINER_ENDED;
    } else {
      terminationReason =
        VIDEO_SESSION_TERMINATION_REASON.USER_ENDED;
    }

    const updatedSession =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          $set: {
            status: VIDEO_SESSION_STATUS.COMPLETED,

            actualEndTime: now,

            terminationReason,
          },
        },
      );

    if (!updatedSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_END,
      );
    }

    // Mark completed
    await this._bookingRepository.updateStatus(session.bookingId, "COMPLETED");

    return VideoSessionMapper.toResponse(
      updatedSession,
    );
  }
}
