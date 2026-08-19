import { CreateNotificationTriggerDto, NotificationPaginationQueryDto, NotificationPaginationResponseDto, NotificationResponseDto } from "../dto/notification.dto";

export interface INotificationService{
    createNotification(data:CreateNotificationTriggerDto):Promise<NotificationResponseDto>;

    getNotifications(recipientId:string,options:NotificationPaginationQueryDto):Promise<NotificationPaginationResponseDto>;

    getUnreadCount(recipientId:string):Promise<number>;

    markAsRead(recipientId:string,notificationId:string):Promise<NotificationResponseDto>;

    markAllAsRead(recipientId:string):Promise<void>;
}