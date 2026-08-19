import { NotificationEntityType, NotificationType } from "../constant/notification.constant";

export interface Notification{
    id:string;
    recipientId:string;
    type:NotificationType;
    title:string;
    message:string;
    entityType?:NotificationEntityType;
    entityId?:string;
    isRead:boolean;
    readAt?:Date;
    createdAt:Date;
    updatedAt:Date;
}

export type CreateNotificationData = Omit<Notification,"id" | "isRead" | "readAt" | "createdAt" | "updatedAt">;

export interface NotificationPaginationResult {
  data: Notification[];
  totalItems: number;
}
export interface NotificationPaginationOptions {
  page: number;
  limit: number;
}