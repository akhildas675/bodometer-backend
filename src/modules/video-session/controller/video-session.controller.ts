import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";

import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";

import { VIDEO_SESSION_TYPES } from "../video-session.types";
import { IVideoSessionService } from "../interface/video.session-service.interface";

@injectable()
export class VideoSessionController {
  constructor(
    @inject(VIDEO_SESSION_TYPES.VideoSessionService)
    private _videoSessionService: IVideoSessionService,
  ) {}

  requestCall = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      const { bookingId } = req.params;

      if (!trainerId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!bookingId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Booking ID is required.",
        );
      }

      const result = await this._videoSessionService.requestCall(
        bookingId,
        trainerId,
      );

      new SuccessResponse(
        STATUS.CREATED,
        "Video call requested successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  acceptCall = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { videoSessionId } = req.params;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!videoSessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Video session ID is required.",
        );
      }

      const result = await this._videoSessionService.acceptCall(
        videoSessionId,
        userId,
      );

      new SuccessResponse(
        STATUS.OK,
        "Video call accepted successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  rejectCall = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { videoSessionId } = req.params;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!videoSessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Video session ID is required.",
        );
      }

      const result = await this._videoSessionService.rejectCall(
        videoSessionId,
        userId,
      );

      

      new SuccessResponse(
        STATUS.OK,
        "Video call rejected successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  markParticipantJoined = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const { videoSessionId } = req.params;

      if (!participantId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!videoSessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Video session ID is required.",
        );
      }

      const result =
        await this._videoSessionService.markParticipantJoined(
          videoSessionId,
          participantId,
        );

      new SuccessResponse(
        STATUS.OK,
        "Participant joined successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  markParticipantLeft = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const { videoSessionId } = req.params;

      if (!participantId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!videoSessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Video session ID is required.",
        );
      }

      const result =
        await this._videoSessionService.markParticipantLeft(
          videoSessionId,
          participantId,
        );

      new SuccessResponse(
        STATUS.OK,
        "Participant left successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getVideoSessionById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const { videoSessionId } = req.params;

      if (!participantId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!videoSessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Video session ID is required.",
        );
      }

      const result =
        await this._videoSessionService.getVideoSessionById(
          videoSessionId,
          participantId,
        );

      new SuccessResponse(
        STATUS.OK,
        "Video session retrieved successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  endVideoSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const { videoSessionId } = req.params;

      if (!participantId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      if (!videoSessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Video session ID is required.",
        );
      }

      const result = await this._videoSessionService.endVideoSession(
        videoSessionId,
        participantId,
      );

      new SuccessResponse(
        STATUS.OK,
        "Video session ended successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}