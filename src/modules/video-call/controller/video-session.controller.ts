import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { VIDEO_CALL_TYPES } from "../video-call.types";
import { IVideoSessionService } from "../interface/video.session-service.interface";
import { getSocketIO } from "@/infrastructure/socket/socket.server";

const videoSessionMessages = (MESSAGES as unknown as {
  VIDEO_SESSION: {
    FETCHED_SUCCESS: string;
  };
}).VIDEO_SESSION;

@injectable()
export class VideoSessionController {
  constructor(
    @inject(VIDEO_CALL_TYPES.Service)
    private readonly _videoSessionService: IVideoSessionService,
  ) {}

  getVideoSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      console.log("get video session")
      const userId = req.user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.getVideoSession(
        bookingId,
        userId,
      );

      new SuccessResponse(
        STATUS.OK,
        videoSessionMessages.FETCHED_SUCCESS,
        session,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  requestCall = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
       console.log("request video call")
      const userId = req.user?.id;
      const { bookingId } = req.body as { bookingId: string };

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.requestCall(
        bookingId,
        userId,
      );

     
      try {
       
        const io = getSocketIO();
        const targetUserId = String(session.userId);
       
        io.to(`video:${session.id}`).emit("video:call-request", session);
      
        io.to(`user:${targetUserId}`).emit("video:call-request", session);
      
      } catch (err) {
        console.error("Failed to emit video call-request socket event:", err);
      }

      new SuccessResponse(
        STATUS.CREATED,
        videoSessionMessages.FETCHED_SUCCESS,
        session,
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

      console.log("Accept video call")
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.acceptCall(id, userId);

      
      try {
        const io = getSocketIO();
        io.to(`video:${session.bookingId}`).emit("video:call-accepted", session);
        io.to(`user:${session.trainerId}`).emit("video:call-accepted", session);
      } catch (err) {
        console.error("Failed to emit video:call-accepted socket event:", err);
      }

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.VIDEO_SESSION.ACCEPT_SUCCESS,
        session,
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

      console.log("reject call")
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.rejectCall(id, userId);

 
      try {
        const io = getSocketIO();
        io.to(`video:${session.bookingId}`).emit("video:call-rejected", session);
        io.to(`user:${session.trainerId}`).emit("video:call-rejected", session);
      } catch (err) {
        console.error("Failed to emit video:call-rejected socket event:", err);
      }

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.VIDEO_SESSION.REJECT_SUCCESS,
        session,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  joinSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.joinSession(id, userId);
      try {
        const io = getSocketIO();
        io.to(`video:${session.bookingId}`).emit("video:participant-joined", { participantId: userId, session });
      } catch (err) {
        console.error("Failed to emit video:participant-joined socket event:", err);
      }

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.VIDEO_SESSION.JOIN_SUCCESS,
        session,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  leaveSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.leaveSession(id, userId);

   
      try {
        const io = getSocketIO();
        io.to(`video:${session.bookingId}`).emit("video:participant-left", { participantId: userId, session });
      } catch (err) {
        console.error("Failed to emit video:participant-left socket event:", err);
      }

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.VIDEO_SESSION.LEAVE_SUCCESS,
        session,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  endSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.UNAUTHORIZED);
      }

      const session = await this._videoSessionService.endSession(id, userId);

      
      try {
        const io = getSocketIO();
        io.to(`video:${session.bookingId}`).emit("video:session-ended", session);
      } catch (err) {
        console.error("Failed to emit video:session-ended socket event:", err);
      }

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.VIDEO_SESSION.END_SUCCESS,
        session,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
