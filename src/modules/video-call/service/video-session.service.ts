import { inject, injectable } from "inversify";


import {
  VideoSessionResponseDto,
} from "../dto/video-session.dto";

import {
  VideoSessionMapper,
} from "../mapper/video-session.mapper";


import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { IVideoSessionService } from "../interface/video.session-service.interface";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { VIDEO_CALL_TYPES } from "../video-call.types";

@injectable()
export default class VideoSessionService
  implements IVideoSessionService
{
  constructor(
    @inject(VIDEO_CALL_TYPES.Repository)
    private readonly _videoSessionRepository:
      IVideoSessionRepository,
  ) {}


  async getVideoSession(
    bookingId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    const session =
      await this._videoSessionRepository.getByBookingId(
        bookingId,
      );

    if (!session) {
      throw new AppError(
        STATUS.NOT_FOUND,
        "Video session not found",
      );
    }


    if (
      session.trainerId !== userId &&
      session.userId !== userId
    ) {
      throw new AppError(
        STATUS.FORBIDDEN,
        "You are not authorized to access this video session",
      );
    }

    return VideoSessionMapper.toResponse(session);
  }



  async requestCall(
    bookingId: string,
    trainerId: string,
  ): Promise<VideoSessionResponseDto> {
   

    const existingSession =
      await this._videoSessionRepository.getByBookingId(
        bookingId,
      );

    if (existingSession) {
      throw new AppError(
        STATUS.CONFLICT,
        "Video session has already been created for this booking",
      );
    }

  

    throw new Error(
      "Booking validation is required before implementing requestCall",
    );
  }


  async acceptCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    throw new Error("Not implemented");
  }



  async rejectCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto> {
    throw new Error("Not implemented");
  }


  async joinSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    throw new Error("Not implemented");
  }


  async leaveSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    throw new Error("Not implemented");
  }


  async endSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto> {
    throw new Error("Not implemented");
  }
}