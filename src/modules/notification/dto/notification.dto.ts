import {
  NotificationEntityType,
  NotificationType,
} from "../constant/notification.constant";
import { NotificationTemplate } from "../constant/notification.template";


export interface CreateNotificationTriggerDto {
  recipientId: string;
  type: NotificationType;
  entityType?: NotificationEntityType;
  entityId?: string;
  variables?: Record<string, string | number>;
}

export interface NotificationDto {
    id: string;
    recipientId: string;
    type: NotificationType;
    title: string;
    message: string;
    entityType?: NotificationEntityType;
    entityId?: string;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date; 
    updatedAt: Date;
}

export interface NotificationResponseDto {
  id: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: NotificationEntityType;
  entityId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPaginationQueryDto {
  page: number;
  limit: number;
}

export interface NotificationPaginationResponseDto {
  data: NotificationResponseDto[];
  totalItems: number;
}

export interface MarkNotificationReadDto {
  notificationId: string;
}