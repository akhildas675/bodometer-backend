import { NotificationDto, NotificationResponseDto } from "../dto/notification.dto";

export class NotificationMapper {
  public static toResponse(
    notification: NotificationDto,
  ): NotificationResponseDto {
    return {
      id: notification.id,
      recipientId: notification.recipientId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      entityType: notification.entityType,
      entityId: notification.entityId,
      isRead: notification.isRead,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}