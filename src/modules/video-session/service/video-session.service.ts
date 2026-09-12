import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import { SocketManager } from "@/infrastructure/socket/socket.manager";
import { IVideoSessionService } from "../interface/video.session-service.interface";
import { VIDEO_SESSION_TYPES } from "../video-session.types";
import { BOOKING_TYPES } from "@/modules/booking/booking.types";
import { IBookingRepository } from "@/modules/booking/interface/repository.interface/booking-repository.interface";
import { IBookingRefundRepository } from "@/modules/booking/repositories/booking-refund.repository";
import { WALLET_TYPES } from "@/modules/wallet/wallet.types";
import { IWalletService } from "@/modules/wallet/services/wallet.service";
import { USER_TYPES } from "@/modules/user/user.types";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";
import { TRAINER_TYPES } from "@/modules/trainer/trainer.types";
import { ITrainerProfileRepository } from "@/modules/trainer/interface/trainer.profile-repository.interface";
import { VideoSessionResponseDto } from "../dto/video-session.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { BOOKING_STATUS } from "@/constants/constant.values.ts/booking.constant";
import {
  INCOMPLETE_SESSION_REFUND_POLICY,
  VIDEO_SESSION_REFUND_STATUS,
  VIDEO_SESSION_STATUS,
  VIDEO_SESSION_TERMINATION_REASON,
  VideoSessionRefundStatus,
  VideoSessionStatus,
  VideoSessionTerminationReason,
} from "../constant/video-session.constant";
import {
  CreateVideoSessionData,
  VideoSession,
} from "../interface/video-session.interface";
import { VideoSessionMapper } from "../mapper/video-session.mapper";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { COACHING_TYPES } from "@/modules/coaching/coaching.types";

import { ICoachingRepository } from "@/modules/coaching/interface/coaching-repository.interface";

@injectable()
export class VideoSessionService implements IVideoSessionService {
  constructor(
    @inject(VIDEO_SESSION_TYPES.VideoSessionRepository)
    private _videoSessionRepository: IVideoSessionRepository,

    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(WALLET_TYPES.WalletService)
    private _walletService: IWalletService,

    @inject(BOOKING_TYPES.BookingRefundRepository)
    private _refundRepository: IBookingRefundRepository,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,

    @inject(TRAINER_TYPES.TrainerProfileRepository)
    private _trainerProfileRepository: ITrainerProfileRepository,

    @inject(COACHING_TYPES.CoachingRepository)
    private _coachingRepository:ICoachingRepository
  ) {}

  async requestCall(
    bookingId: string,
    trainerId: string,
  ): Promise<VideoSessionResponseDto> {
    const booking = await this._bookingRepository.findById(bookingId);

    if (!booking) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.BOOKING.BOOKING_NOT_FOUND,
      );
    }

    if (booking.trainerId !== trainerId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_START,
      );
    }

    if (booking.status !== BOOKING_STATUS.CONFIRMED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.BOOKING_NOT_FOUND,
      );
    }

    const now = new Date();

    const requestWindowEnd = new Date(
      booking.startTime.getTime() + 10 * 60 * 1000,
    );

    if (now < booking.startTime) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.CANNOT_START_BEFORE,
      );
    }

    if (now > requestWindowEnd) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.WINDOW_EXPIRED,
      );
    }

    const existingSession =
      await this._videoSessionRepository.getVideoSessionByBookingId(
        bookingId,
      );

    if (existingSession) {
      if (
        existingSession.status === VIDEO_SESSION_STATUS.WAITING ||
        existingSession.status === VIDEO_SESSION_STATUS.ACCEPTED ||
        existingSession.status === VIDEO_SESSION_STATUS.ACTIVE
      ) {
        throw new AppError(
          STATUS.CONFLICT,
          MESSAGES.VIDEO_SESSION.VIDEO_SESSION_EXISTS,
        );
      }

      throw new AppError(
        STATUS.CONFLICT,
        MESSAGES.VIDEO_SESSION.BOOKING_HAS_COMPLETED,
      );
    }

    const sessionData: CreateVideoSessionData = {
      bookingId: booking.id,
      trainerId: booking.trainerId,
      userId: booking.userId,
      scheduledStartTime: booking.startTime,
      scheduledEndTime: booking.endTime,
      trainerStartRequestedAt: now,
      status: VIDEO_SESSION_STATUS.WAITING,
    };

    const videoSession =
      await this._videoSessionRepository.createVideoSession(sessionData);

    SocketManager.emitToUser(videoSession.userId, "video:call-request", { videoSessionId: videoSession.id });
return VideoSessionMapper.toVideoSessionResponseDto(videoSession);
  }

  async acceptCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionById(
        videoSessionId,
      );

    if (!videoSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    if (videoSession.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_ACCEPT,
      );
    }

    if (videoSession.status !== VIDEO_SESSION_STATUS.WAITING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_ACCEPT,
      );
    }

    if (!videoSession.trainerStartRequestedAt) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.REQUEST_TIME_MISSING,
      );
    }

    const now = new Date();

    const acceptanceWindowEnd = new Date(
      videoSession.trainerStartRequestedAt.getTime() + 5 * 60 * 1000,
    );

    if (now > acceptanceWindowEnd) {
      const expired =
        await this._videoSessionRepository.updateVideoSession(
          videoSessionId,
          {
            status: VIDEO_SESSION_STATUS.EXPIRED,
            terminationReason:
              VIDEO_SESSION_TERMINATION_REASON.USER_NO_SHOW,
            actualEndTime: now,
          },
        );

      if (!expired) {
        throw new AppError(
          STATUS.INTERNAL_ERROR,
          MESSAGES.VIDEO_SESSION.FAILED_TO_EXPIRED,
        );
      }

      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.WINDOW_EXPIRED,
      );
    }

    // Session duration (e.g. 60 mins from original booking schedule)
    const scheduledDurationMs =
      videoSession.scheduledEndTime.getTime() -
      videoSession.scheduledStartTime.getTime();
    const sessionDurationMs =
      scheduledDurationMs > 0 ? scheduledDurationMs : 60 * 60 * 1000;

    // Time starts running when the user accepts:
    const newScheduledEndTime = new Date(now.getTime() + sessionDurationMs);

    const updated =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          status: VIDEO_SESSION_STATUS.ACCEPTED,
          userAcceptedAt: now,
          actualStartTime: now,
          scheduledEndTime: newScheduledEndTime,
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.FAILED_TO_ACCEPT,
      );
    }

    const responseDto = VideoSessionMapper.toVideoSessionResponseDto(updated);

    // Notify trainer and active room that user accepted and timer has started
    const room = `video:session:${videoSessionId}`;
    const payload = { videoSessionId, session: responseDto };
    SocketManager.emitToRoom(room, "video:call-accepted", payload);
    SocketManager.emitToUser(videoSession.trainerId, "video:call-accepted", payload);
    SocketManager.emitToUser(videoSession.userId, "video:call-accepted", payload);

    return responseDto;
  }

  async rejectCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionById(
        videoSessionId,
      );

    if (!videoSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    if (videoSession.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        MESSAGES.VIDEO_SESSION.UNAUTHORIZED_ACCEPT,
      );
    }

    if (videoSession.status !== VIDEO_SESSION_STATUS.WAITING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.CANNOT_REJECT_STATE,
      );
    }

    const updated =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          status: VIDEO_SESSION_STATUS.CANCELLED,
          terminationReason:
            VIDEO_SESSION_TERMINATION_REASON.USER_REJECTED,
          actualEndTime: new Date(),
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_REJECT,
      );
    }

    return VideoSessionMapper.toVideoSessionResponseDto(updated);
  }

async markParticipantJoined(
  videoSessionId: string,
  participantId: string,
): Promise<VideoSessionResponseDto> {
  const videoSession =
    await this._videoSessionRepository.getVideoSessionById(
      videoSessionId,
    );

  if (!videoSession) {
    throw new AppError(
      STATUS.NOT_FOUND,
      MESSAGES.VIDEO_SESSION.NOT_FOUND,
    );
  }

  this.ensureParticipant(videoSession, participantId);

  const now = new Date();

  const updateData: Partial<VideoSession> = {};

  if (videoSession.trainerId === participantId) {
    updateData.trainerJoinedAt = now;
  }

  if (videoSession.userId === participantId) {
    updateData.userJoinedAt = now;
  }

  const trainerJoined =
    videoSession.trainerId === participantId ||
    Boolean(videoSession.trainerJoinedAt);

  const userJoined =
    videoSession.userId === participantId ||
    Boolean(videoSession.userJoinedAt);

  if (trainerJoined && userJoined) {
    updateData.status = VIDEO_SESSION_STATUS.ACTIVE;
    updateData.actualStartTime =
      videoSession.actualStartTime || now;
  }

  const updated =
    await this._videoSessionRepository.updateVideoSession(
      videoSessionId,
      updateData,
    );

  if (!updated) {
    throw new AppError(
      STATUS.INTERNAL_ERROR,
      MESSAGES.VIDEO_SESSION.UNABLE_TO_UPDATE,
    );
  }

  return VideoSessionMapper.toVideoSessionResponseDto(updated);
}



  async markParticipantLeft(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionById(
        videoSessionId,
      );

    if (!videoSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    this.ensureParticipant(videoSession, participantId);

    const now = new Date();

    const updateData: Partial<VideoSession> = {};

    if (videoSession.trainerId === participantId) {
      if (!videoSession.trainerLeftAt) {
        updateData.trainerLeftAt = now;
      }
    }

    if (videoSession.userId === participantId) {
      if (!videoSession.userLeftAt) {
        updateData.userLeftAt = now;
      }
    }

    const updated =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        updateData,
      );

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_UPDATE,
      );
    }

    return VideoSessionMapper.toVideoSessionResponseDto(updated);
  }

  async getVideoSessionById(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionById(
        videoSessionId,
      );

    if (!videoSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    this.ensureParticipant(videoSession, participantId);

    return VideoSessionMapper.toVideoSessionResponseDto(
      videoSession,
    );
  }

  async endVideoSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionById(
        videoSessionId,
      );

    if (!videoSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    this.ensureParticipant(videoSession, participantId);

    if (
      videoSession.status === VIDEO_SESSION_STATUS.COMPLETED ||
      videoSession.status === VIDEO_SESSION_STATUS.INCOMPLETE ||
      videoSession.status === VIDEO_SESSION_STATUS.CANCELLED ||
      videoSession.status === VIDEO_SESSION_STATUS.EXPIRED
    ) {
      return VideoSessionMapper.toVideoSessionResponseDto(
        videoSession,
      );
    }

    const now = new Date();
    const startTime = videoSession.actualStartTime
      ? new Date(videoSession.actualStartTime)
      : null;

    let actualDurationMinutes = 0;
    if (startTime) {
      actualDurationMinutes = Math.max(
        0,
        Math.floor((now.getTime() - startTime.getTime()) / 60000),
      );
    }

    const booking = await this._bookingRepository.findById(
      videoSession.bookingId,
    );


    let newStatus: VideoSessionStatus;
    let terminationReason: VideoSessionTerminationReason;
    let refundEligible = false;
    let refundStatus: VideoSessionRefundStatus =
      VIDEO_SESSION_REFUND_STATUS.NOT_ELIGIBLE;

    if (!startTime) {
      
      newStatus = VIDEO_SESSION_STATUS.CANCELLED;
      terminationReason =
        participantId === videoSession.trainerId
          ? VIDEO_SESSION_TERMINATION_REASON.TRAINER_CANCELLED
          : VIDEO_SESSION_TERMINATION_REASON.USER_CANCELLED;
      refundEligible = true;
      refundStatus = VIDEO_SESSION_REFUND_STATUS.ELIGIBLE;
    } else if (
      actualDurationMinutes <
      INCOMPLETE_SESSION_REFUND_POLICY.MIN_DURATION_MINUTES_FOR_COMPLETION
    ) {
    
      newStatus = VIDEO_SESSION_STATUS.INCOMPLETE;
      terminationReason =
        participantId === videoSession.trainerId
          ? VIDEO_SESSION_TERMINATION_REASON.TRAINER_CANCELLED
          : VIDEO_SESSION_TERMINATION_REASON.USER_CANCELLED;
      refundEligible = true;
      refundStatus = VIDEO_SESSION_REFUND_STATUS.ELIGIBLE;
    } else {
  
      newStatus = VIDEO_SESSION_STATUS.COMPLETED;
      terminationReason = VIDEO_SESSION_TERMINATION_REASON.SCHEDULED_END;
      refundEligible = false;
      refundStatus = VIDEO_SESSION_REFUND_STATUS.NOT_ELIGIBLE;
    }

    const updated =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          status: newStatus,
          actualEndTime: now,
          actualDurationMinutes,
          terminationReason,
          refundEligible,
          refundStatus,
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_UPDATE,
      );
    }

    if (
      (newStatus === VIDEO_SESSION_STATUS.COMPLETED ||
        newStatus === VIDEO_SESSION_STATUS.INCOMPLETE) &&
      booking
    ) {
      await this._bookingRepository.updateStatus(
        booking.id,
        BOOKING_STATUS.COMPLETED,
      );
    }

    const responseDto = VideoSessionMapper.toVideoSessionResponseDto(updated);

    const room = `video:session:${videoSessionId}`;
    const endPayload = { videoSessionId, session: responseDto };
    SocketManager.emitToRoom(room, "video:session-ended", endPayload);
    SocketManager.emitToUser(videoSession.userId, "video:session-ended", endPayload);
    SocketManager.emitToUser(videoSession.trainerId, "video:session-ended", endPayload);

    return responseDto;
  }

  async requestRefund(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionById(
        videoSessionId,
      );

    if (!videoSession) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.NOT_FOUND,
      );
    }

    if (videoSession.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        "Only the user who booked this session can request a refund.",
      );
    }

    if (
      videoSession.refundStatus ===
      VIDEO_SESSION_REFUND_STATUS.COMPLETED
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Refund has already been processed for this session.",
      );
    }

    if (
      !videoSession.refundEligible ||
      videoSession.refundStatus !==
        VIDEO_SESSION_REFUND_STATUS.ELIGIBLE
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "This session is not eligible for a refund.",
      );
    }

    const booking = await this._bookingRepository.findById(
      videoSession.bookingId,
    );

    if (!booking) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.BOOKING.BOOKING_NOT_FOUND,
      );
    }

    const refundAmount = booking.price;

    if (refundAmount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Refund amount must be greater than 0.",
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const refund = await this._refundRepository.createOne({
        bookingId: booking.id,
        paymentId: booking.paymentId || "",
        userId: booking.userId,
        trainerId: booking.trainerId,
        amount: refundAmount,
        currency: "inr",
        reason: `Refund for incomplete video session (${videoSession.actualDurationMinutes ?? 0} mins conducted)`,
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
          description: `Incomplete session refund for session #${booking.bookingNumber}`,
        },
        session,
      );

      const updated =
        await this._videoSessionRepository.updateVideoSession(
          videoSessionId,
          {
            refundStatus: VIDEO_SESSION_REFUND_STATUS.COMPLETED,
            refundId: refund.id,
            refundRequestedAt: new Date(),
            refundProcessedAt: new Date(),
          },
        );

      if (!updated) {
        throw new AppError(
          STATUS.INTERNAL_ERROR,
          MESSAGES.VIDEO_SESSION.UNABLE_TO_UPDATE,
        );
      }

      await session.commitTransaction();

      return VideoSessionMapper.toVideoSessionResponseDto(
        updated,
      );
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }

  async claimExpiredBookingRefund(
    bookingId: string,
    userId: string,
  ): Promise<{
    booking: unknown;
    refund: unknown;
    videoSession?: VideoSessionResponseDto;
  }> {
    const booking = await this._bookingRepository.findById(bookingId);

    if (!booking) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.BOOKING.BOOKING_NOT_FOUND,
      );
    }

    if (booking.userId !== userId) {
      throw new AppError(
        STATUS.FORBIDDEN,
        "Only the user who booked this session can claim a refund.",
      );
    }

    if (booking.status === BOOKING_STATUS.COMPLETED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "This session was already completed.",
      );
    }

    if (booking.status === BOOKING_STATUS.CANCELLED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "This booking has already been cancelled.",
      );
    }

    const existingRefund = await this._refundRepository.findByBookingId(booking.id);
    if (existingRefund && existingRefund.status === "COMPLETED") {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Refund has already been processed for this booking.",
      );
    }

    const isPast = new Date(booking.endTime).getTime() < Date.now();
    if (
      !isPast &&
      booking.status !== BOOKING_STATUS.EXPIRED &&
      booking.status !== BOOKING_STATUS.NO_SHOW
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "This booking has not yet expired.",
      );
    }

    const refundAmount = booking.price;
    if (refundAmount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Refund amount must be greater than 0.",
      );
    }

    const existingVs =
      await this._videoSessionRepository.getVideoSessionByBookingId(booking.id);

    if (
      existingVs &&
      existingVs.refundStatus === VIDEO_SESSION_REFUND_STATUS.COMPLETED
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Refund has already been processed for this session.",
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const refund = await this._refundRepository.createOne({
        bookingId: booking.id,
        paymentId: booking.paymentId || "",
        userId: booking.userId,
        trainerId: booking.trainerId,
        amount: refundAmount,
        currency: "inr",
        reason: `100% refund for expired session #${booking.bookingNumber}`,
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
          description: `Full refund for expired session #${booking.bookingNumber}`,
        },
        session,
      );

      const updatedBooking = await this._bookingRepository.updateStatus(
        booking.id,
        BOOKING_STATUS.EXPIRED,
      );

      let updatedVideoSessionDto: VideoSessionResponseDto | undefined;
      if (existingVs && existingVs.id) {
        const updatedVs =
          await this._videoSessionRepository.updateVideoSession(existingVs.id, {
            status:
              existingVs.status === VIDEO_SESSION_STATUS.WAITING ||
              existingVs.status === VIDEO_SESSION_STATUS.ACCEPTED ||
              existingVs.status === VIDEO_SESSION_STATUS.ACTIVE
                ? VIDEO_SESSION_STATUS.CANCELLED
                : existingVs.status,
            refundEligible: true,
            refundStatus: VIDEO_SESSION_REFUND_STATUS.COMPLETED,
            refundId: refund.id,
            refundRequestedAt: new Date(),
            refundProcessedAt: new Date(),
          });
        if (updatedVs) {
          updatedVideoSessionDto =
            VideoSessionMapper.toVideoSessionResponseDto(updatedVs);
        }
      }

      await session.commitTransaction();

      return {
        booking: updatedBooking || booking,
        refund,
        videoSession: updatedVideoSessionDto,
      };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
    }
  }
  async getVideoSessionHistory(
    participantId: string,
    role: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      refundStatus?: string;
    },
  ): Promise<{
    sessions: VideoSessionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page =
      query.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit =
      query.limit && Number(query.limit) > 0 ? Number(query.limit) : 10;

    const filter: Record<string, unknown> = {};
    if (role === "TRAINER") {
      const trainerIds: (string | mongoose.Types.ObjectId)[] = [participantId];
      if (mongoose.Types.ObjectId.isValid(participantId)) {
        trainerIds.push(new mongoose.Types.ObjectId(participantId));
      }
      const profile =
        await this._trainerProfileRepository.findByUserId(participantId);
      if (profile && profile.userId) {
        const profileUserId = profile.userId.toString();
        trainerIds.push(profileUserId);
        if (mongoose.Types.ObjectId.isValid(profileUserId)) {
          trainerIds.push(new mongoose.Types.ObjectId(profileUserId));
        }
      }
      filter.trainerId = { $in: trainerIds };
    } else {
      const userIds: (string | mongoose.Types.ObjectId)[] = [participantId];
      if (mongoose.Types.ObjectId.isValid(participantId)) {
        userIds.push(new mongoose.Types.ObjectId(participantId));
      }
      filter.userId = { $in: userIds };
    }

    if (query.status) {
      filter.status = query.status;
    }
    if (query.refundStatus) {
      filter.refundStatus = query.refundStatus;
    }

    const { sessions, total } =
      await this._videoSessionRepository.getSessionHistory(
        filter,
        page,
        limit,
      );

    const enrichedSessions: VideoSessionResponseDto[] = [];
    for (const session of sessions) {
      const dto = VideoSessionMapper.toVideoSessionResponseDto(session);

      const booking = await this._bookingRepository.findById(
        session.bookingId,
      );
      if (booking) {
        dto.bookingNumber = booking.bookingNumber;
        dto.sessionPrice = booking.price;
        dto.serviceName =
          booking.serviceSnapshot?.name || "1-on-1 Coaching Session";

        if (role === "TRAINER") {
          dto.otherParticipantName =
            booking.userName ||
            (await this._userRepository.findById(session.userId))?.name ||
            "Client";
          dto.otherParticipantEmail =
            booking.userEmail ||
            (await this._userRepository.findById(session.userId))?.email;
        } else {
          let trainerUser = await this._userRepository.findById(
            session.trainerId,
          );
          if (!trainerUser) {
            const profile =
              await this._trainerProfileRepository.findById(
                session.trainerId,
              );
            if (profile && profile.userId) {
              trainerUser = await this._userRepository.findById(
                profile.userId.toString(),
              );
            }
          }
          dto.otherParticipantName = trainerUser?.name || "Trainer";
          dto.otherParticipantEmail = trainerUser?.email;
        }
      }

      enrichedSessions.push(dto);
    }

    return {
      sessions: enrichedSessions,
      total,
      page,
      limit,
    };
  }

  async getVideoSessionByBookingId(
    bookingId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto | null> {
    const videoSession =
      await this._videoSessionRepository.getVideoSessionByBookingId(bookingId);

    if (!videoSession) {
      return null;
    }

    this.ensureParticipant(videoSession, participantId);

    const rejoinableStatuses: string[] = [
      VIDEO_SESSION_STATUS.WAITING,
      VIDEO_SESSION_STATUS.ACCEPTED,
      VIDEO_SESSION_STATUS.ACTIVE,
    ];

    if (!rejoinableStatuses.includes(videoSession.status)) {
      return null;
    }

    return VideoSessionMapper.toVideoSessionResponseDto(videoSession);
  }

  private ensureParticipant(
    videoSession: VideoSession,
    participantId: string,
  ): void {
    if (
      videoSession.trainerId !== participantId &&
      videoSession.userId !== participantId
    ) {
      throw new AppError(
        STATUS.FORBIDDEN,
        "You are not a participant in this video session",
      );
    }
  }
}
