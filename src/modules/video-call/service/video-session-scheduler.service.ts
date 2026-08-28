import { inject, injectable } from "inversify";
import logger from "@/config/logger.config";
import { VIDEO_CALL_TYPES } from "../video-call.types";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { IBookingRepository } from "@/modules/booking/interface/repository.interface/booking-repository.interface";
import { BOOKING_TYPES } from "@/modules/booking/booking.types";
import { WALLET_TYPES } from "@/modules/wallet/wallet.types";
import { IWalletService } from "@/modules/wallet/services/wallet.service";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_TYPE,
} from "@/modules/notification/constant/notification.constant";
import {
  VIDEO_SESSION_STATUS,
  VIDEO_SESSION_TERMINATION_REASON,
} from "../constant/video-session.constant";

@injectable()
export class VideoSessionSchedulerService {
  private _intervalId: NodeJS.Timeout | null = null;

  constructor(
    @inject(VIDEO_CALL_TYPES.Repository)
    private readonly _videoSessionRepository: IVideoSessionRepository,
    @inject(BOOKING_TYPES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,
    @inject(WALLET_TYPES.WalletService)
    private readonly _walletService: IWalletService,
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly _notificationService: INotificationService,
  ) {}

  public startScheduler(intervalMs: number = 30000): void {
    if (this._intervalId) {
      logger.info("Video session scheduler is already running.");
      return;
    }

    logger.info(`Starting video session scheduler (interval: ${intervalMs}ms)...`);
    this._intervalId = setInterval(() => {
      this.processTimeouts().catch((err) => {
        logger.error({ err }, "Error running video session timeout processor");
      });
    }, intervalMs);
  }

  public stopScheduler(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
      logger.info("Video session scheduler stopped.");
    }
  }

  public async processTimeouts(): Promise<void> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    //  User No Show Timeout 
    const waitingSessions = await this._videoSessionRepository.findSessions({
      status: VIDEO_SESSION_STATUS.WAITING,
      trainerStartRequestedAt: { $lte: fiveMinutesAgo },
    });

    for (const session of waitingSessions) {
      await this._videoSessionRepository.updateVideoSession(session.id, {
        status: VIDEO_SESSION_STATUS.CANCELLED,
        terminationReason: VIDEO_SESSION_TERMINATION_REASON.USER_NO_SHOW,
        actualEndTime: now,
      });

      // Update Booking status to cancelled
      await this._bookingRepository.updateStatus(session.bookingId, "CANCELLED");

      // Notify Trainer and User
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

      logger.info(
        `Video session ${session.id} marked as USER_NO_SHOW due to 5-min acceptance timeout.`,
      );
    }

    // active call participant reconnection
    const activeSessions = await this._videoSessionRepository.findSessions({
      status: VIDEO_SESSION_STATUS.ACTIVE,
    });

    for (const session of activeSessions) {
      // if scheduled end time reached
      if (now.getTime() >= session.scheduledEndTime.getTime()) {
        await this._videoSessionRepository.updateVideoSession(session.id, {
          status: VIDEO_SESSION_STATUS.COMPLETED,
          actualEndTime: now,
          terminationReason: VIDEO_SESSION_TERMINATION_REASON.SCHEDULE_ENDED,
        });

        await this._bookingRepository.updateStatus(session.bookingId, "COMPLETED");

        logger.info(
          `Video session ${session.id} marked as COMPLETED (SCHEDULE_ENDED).`,
        );
        continue;
      }

      //disconnection timeout 5 minutes
      const trainerDisconnected =
        session.trainerLeftAt && session.trainerLeftAt.getTime() <= fiveMinutesAgo.getTime();
      const userDisconnected =
        session.userLeftAt && session.userLeftAt.getTime() <= fiveMinutesAgo.getTime();

      if (trainerDisconnected && userDisconnected) {
        await this._videoSessionRepository.updateVideoSession(session.id, {
          status: VIDEO_SESSION_STATUS.CANCELLED,
          actualEndTime: now,
          terminationReason: VIDEO_SESSION_TERMINATION_REASON.BOTH_NO_SHOW,
        });
        await this._bookingRepository.updateStatus(session.bookingId, "CANCELLED");
        logger.info(`Video session ${session.id} terminated (BOTH_NO_SHOW disconnect).`);
      } else if (trainerDisconnected) {
        await this._videoSessionRepository.updateVideoSession(session.id, {
          status: VIDEO_SESSION_STATUS.CANCELLED,
          actualEndTime: now,
          terminationReason: VIDEO_SESSION_TERMINATION_REASON.TRAINER_DISCONNECTED,
        });
        await this._bookingRepository.updateStatus(session.bookingId, "CANCELLED");
        logger.info(`Video session ${session.id} terminated (TRAINER_DISCONNECTED).`);
      } else if (userDisconnected) {
        await this._videoSessionRepository.updateVideoSession(session.id, {
          status: VIDEO_SESSION_STATUS.CANCELLED,
          actualEndTime: now,
          terminationReason: VIDEO_SESSION_TERMINATION_REASON.USER_DISCONNECTED,
        });
        await this._bookingRepository.updateStatus(session.bookingId, "CANCELLED");
        logger.info(`Video session ${session.id} terminated (USER_DISCONNECTED).`);
      }
    }
  }
}
