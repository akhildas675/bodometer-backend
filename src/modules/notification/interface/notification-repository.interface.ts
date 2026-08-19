import { CreateNotificationData, Notification, NotificationPaginationOptions, NotificationPaginationResult } from "./notification.interface";



export interface INotificationRepository {
  createNotification(
    data: CreateNotificationData,
  ): Promise<Notification>;

  getByRecipientId(
    recipientId: string,
    options: NotificationPaginationOptions,
  ): Promise<NotificationPaginationResult>;

  getUnreadCount(
    recipientId: string,
  ): Promise<number>;

  markAsRead(
    notificationId: string,
    recipientId: string,
  ): Promise<Notification | null>;

  markAllAsRead(
    recipientId: string,
  ): Promise<void>;
}