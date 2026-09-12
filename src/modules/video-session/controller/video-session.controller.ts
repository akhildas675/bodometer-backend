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

  getVideoSessionByBookingId = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const { bookingId } = req.params;

      if (!participantId) {
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

      const result =
        await this._videoSessionService.getVideoSessionByBookingId(
          bookingId,
          participantId,
        );

      // result is null when no rejoinable session exists — return null in data,
      // not a 404, so the frontend can show "no session" cleanly.
      new SuccessResponse(
        STATUS.OK,
        result
          ? "Active video session found."
          : "No active video session for this booking.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  requestRefund = async (
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

      const result = await this._videoSessionService.requestRefund(
        videoSessionId,
        userId,
      );

      new SuccessResponse(
        STATUS.OK,
        "Refund processed and credited to wallet successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  claimExpiredSessionRefund = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      if (!bookingId) {
        throw new AppError(STATUS.BAD_REQUEST, "Booking ID is required.");
      }

      const result =
        await this._videoSessionService.claimExpiredBookingRefund(
          bookingId,
          userId,
        );

      new SuccessResponse(
        STATUS.OK,
        "100% refund for expired session credited to wallet successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getVideoSessionHistory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const participantId = req.user?.id;
      const role =
        req.user?.role?.toUpperCase() === "TRAINER" ? "TRAINER" : "USER";

      if (!participantId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      const { page, limit, status, refundStatus } = req.query as {
        page?: string;
        limit?: string;
        status?: string;
        refundStatus?: string;
      };

      const result = await this._videoSessionService.getVideoSessionHistory(
        participantId,
        role,
        {
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
          status,
          refundStatus,
        },
      );

      new SuccessResponse(
        STATUS.OK,
        "Video session history retrieved successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}