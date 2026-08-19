import { Container } from "inversify";
import { INotificationRepository } from "./interface/notification-repository.interface";
import { NOTIFICATION_TYPES } from "./notification.types";
import { NotificationRepository } from "./repository/notification-repository";
import { INotificationService } from "./interface/notification-service.interface";
import { NotificationService } from "./service/notification.service";
import { NotificationController } from "./controller/notification.controller";

export const loadNotificationBindings = (container: Container) => {
  container
    .bind<INotificationRepository>(NOTIFICATION_TYPES.NotificationRepository)
    .to(NotificationRepository)
    .inSingletonScope();

  container
    .bind<INotificationService>(NOTIFICATION_TYPES.NotificationService)
    .to(NotificationService)
    .inSingletonScope();

  container
    .bind<NotificationController>(NOTIFICATION_TYPES.NotificationController)
    .to(NotificationController)
    .inSingletonScope();
};