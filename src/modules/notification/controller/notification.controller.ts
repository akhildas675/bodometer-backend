import { Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { AuthRequest } from "@/middleware/authGuard";
import { INotificationService } from "../interface/notification-service.interface";
import { NOTIFICATION_TYPES } from "../notification.types";
import { STATUS } from "@/constants/constant.values.ts/statuscode";

import { AppError } from "@/utils/appError";
import { MESSAGES } from "@/constants/messages";

@injectable()
export class NotificationController {
  constructor(
    @inject(NOTIFICATION_TYPES.NotificationService)
    private _notificationService: INotificationService,
  ) {}

  getNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED,MESSAGES.NOTIFICATION.USER_NOT_AUTHENTICATED);
      }
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const result = await this._notificationService.getNotifications(userId, {
        page,
        limit,
      });
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.NOTIFICATION.FETCHED,
        data: result.data,
        totalItems: result.totalItems,
        page,
        limit,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.NOTIFICATION.USER_NOT_AUTHENTICATED);
      }

      const count = await this._notificationService.getUnreadCount(userId);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.NOTIFICATION.UNREAD_COUNT_FETCHED,
        unreadCount: count,
      });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.NOTIFICATION.USER_NOT_AUTHENTICATED);
      }
      const notificationId = req.params.id;

      const updated = await this._notificationService.markAsRead(
        userId,
        notificationId,
      );
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.NOTIFICATION.MARKED_AS_READ,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  markAllAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.NOTIFICATION.USER_NOT_AUTHENTICATED);
      }

      await this._notificationService.markAllAsRead(userId);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.NOTIFICATION.ALL_MARKED_AS_READ,
      });
    } catch (error) {
      next(error);
    }
  };
}
