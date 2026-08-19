import { inject, injectable } from "inversify";
import { INotificationService } from "../interface/notification-service.interface";
import { NOTIFICATION_TYPES } from "../notification.types";
import { INotificationRepository } from "../interface/notification-repository.interface";
import {
  CreateNotificationTriggerDto,
  NotificationPaginationQueryDto,
  NotificationPaginationResponseDto,
  NotificationResponseDto,
} from "../dto/notification.dto";
import { NOTIFICATION_TEMPLATES } from "../constant/notification.template";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { SocketManager } from "@/infrastructure/socket/socket.manager";

import { AUTH_TYPES } from "@/modules/auth/auth.types";
import { USER_TYPES } from "@/modules/user/user.types";
import { IMailService } from "@/modules/otp/interface/mail-service.interface";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(NOTIFICATION_TYPES.NotificationRepository)
    private _notificationRepository: INotificationRepository,

    @inject(AUTH_TYPES.MailService)
    private _mailService: IMailService,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,
  ) {}

  private renderTemplate(
    template: string,
    variables?: Record<string, string | number>,
  ): string {
    if (!variables) return template;
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
      return variables[key] !== undefined ? String(variables[key]) : "";
    });
  }

  async createNotification(
    data: CreateNotificationTriggerDto,
  ): Promise<NotificationResponseDto> {
    const template = NOTIFICATION_TEMPLATES[data.type];
    const title = template
      ? this.renderTemplate(template.title, data.variables)
      : data.type.replace(/_/g, " ");
    const message = template
      ? this.renderTemplate(template.message, data.variables)
      : MESSAGES.NOTIFICATION.DEFAULT_MESSAGE;

    const created = await this._notificationRepository.createNotification({
      recipientId: data.recipientId,
      type: data.type,
      title,
      message,
      entityType: data.entityType,
      entityId: data.entityId,
    });

    // 1. Real-time Socket push notification
    SocketManager.emitToUser(data.recipientId, "notification:new", created);

    // 2. Asynchronous email notification dispatch via MailService
    this.sendNotificationEmail(data.recipientId, title, message).catch((err) =>
      console.error("Email notification dispatch error:", err),
    );

    return created;
  }

  private async sendNotificationEmail(
    recipientId: string,
    title: string,
    message: string,
  ): Promise<void> {
    try {
      const user = await this._userRepository.findById(recipientId);
      if (!user || !user.email) return;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #03000D; color: #ffffff; border-radius: 16px; border: 1px solid #334155;">
          <h2 style="color: #a855f7; margin-bottom: 12px; font-size: 20px;">${title}</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #e2e8f0; margin-bottom: 20px;">${message}</p>
          <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">This is an automated notification from Bodometer Fitness Platform.</p>
        </div>
      `;

      await this._mailService.sendMail({
        to: user.email,
        subject: `Bodometer - ${title}`,
        html,
      });
    } catch (err) {
      console.error("Failed to send notification email:", err);
    }
  }

  async getNotifications(
    recipientId: string,
    options: NotificationPaginationQueryDto,
  ): Promise<NotificationPaginationResponseDto> {
    return this._notificationRepository.getByRecipientId(recipientId, options);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this._notificationRepository.getUnreadCount(recipientId);
  }

  async markAsRead(
    recipientId: string,
    notificationId: string,
  ): Promise<NotificationResponseDto> {
    const updated = await this._notificationRepository.markAsRead(
      notificationId,
      recipientId,
    );
    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, MESSAGES.NOTIFICATION.NOT_FOUND);
    }
    return updated;
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this._notificationRepository.markAllAsRead(recipientId);
  }
}