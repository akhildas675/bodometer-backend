import { inject, injectable } from "inversify";
import { IVideoSessionService } from "../interface/video.session-service.interface";
import { VIDEO_SESSION_TYPES } from "../video-session.types";
import { BOOKING_TYPES } from "@/modules/booking/booking.types";
import { IBookingRepository } from "@/modules/booking/interface/repository.interface/booking-repository.interface";
import { VideoSessionResponseDto } from "../dto/video-session.dto";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { BOOKING_STATUS } from "@/constants/constant.values.ts/booking.constant";
import {
  VIDEO_SESSION_STATUS,
  VIDEO_SESSION_TERMINATION_REASON,
} from "../constant/video-session.constant";
import {
  CreateVideoSessionData,
  VideoSession,
} from "../interface/video-session.interface";
import { VideoSessionMapper } from "../mapper/video-session.mapper";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";

@injectable()
export class VideoSessionService implements IVideoSessionService {
  constructor(
    @inject(VIDEO_SESSION_TYPES.VideoSessionRepository)
    private _videoSessionRepository: IVideoSessionRepository,

    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,
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

    const updated =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          status: VIDEO_SESSION_STATUS.ACCEPTED,
          userAcceptedAt: now,
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.NOT_FOUND,
        MESSAGES.VIDEO_SESSION.FAILED_TO_ACCEPT,
      );
    }

    return VideoSessionMapper.toVideoSessionResponseDto(updated);
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

    if (
      videoSession.status !== VIDEO_SESSION_STATUS.ACCEPTED &&
      videoSession.status !== VIDEO_SESSION_STATUS.ACTIVE
    ) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_JOIN,
      );
    }

    const now = new Date();

    const updateData: Partial<VideoSession> = {};

    if (videoSession.trainerId === participantId) {
      if (!videoSession.trainerJoinedAt) {
        updateData.trainerJoinedAt = now;
      }
    }

    if (videoSession.userId === participantId) {
      if (!videoSession.userJoinedAt) {
        updateData.userJoinedAt = now;
      }
    }

    const trainerJoined =
      videoSession.trainerId === participantId ||
      !!videoSession.trainerJoinedAt;

    const userJoined =
      videoSession.userId === participantId ||
      !!videoSession.userJoinedAt;

    if (
      trainerJoined &&
      userJoined &&
      videoSession.status === VIDEO_SESSION_STATUS.ACCEPTED
    ) {
      updateData.status = VIDEO_SESSION_STATUS.ACTIVE;
      updateData.actualStartTime = now;
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
      videoSession.status === VIDEO_SESSION_STATUS.CANCELLED ||
      videoSession.status === VIDEO_SESSION_STATUS.EXPIRED
    ) {
      return VideoSessionMapper.toVideoSessionResponseDto(
        videoSession,
      );
    }

    const now = new Date();

    let terminationReason:
      | typeof VIDEO_SESSION_TERMINATION_REASON.USER_CANCELLED
      | typeof VIDEO_SESSION_TERMINATION_REASON.TRAINER_CANCELLED;

    if (videoSession.trainerId === participantId) {
      terminationReason =
        VIDEO_SESSION_TERMINATION_REASON.TRAINER_CANCELLED;
    } else {
      terminationReason =
        VIDEO_SESSION_TERMINATION_REASON.USER_CANCELLED;
    }

    const updated =
      await this._videoSessionRepository.updateVideoSession(
        videoSessionId,
        {
          status: VIDEO_SESSION_STATUS.CANCELLED,
          actualEndTime: now,
          terminationReason,
        },
      );

    if (!updated) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        MESSAGES.VIDEO_SESSION.UNABLE_TO_UPDATE,
      );
    }

    return VideoSessionMapper.toVideoSessionResponseDto(updated);
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