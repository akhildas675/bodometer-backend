import { Router } from "express";
import container from "@/container/container";
import { NOTIFICATION_TYPES } from "../notification.types";
import { NotificationController } from "../controller/notification.controller";
import { NOTIFICATION_PATHS } from "@/constants/routes.constant/notification.paths";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";

const notificationRouter = Router();

const notificationController = container.get<NotificationController>(
  NOTIFICATION_TYPES.NotificationController,
);

notificationRouter.get(
  NOTIFICATION_PATHS.ROOT,
  ROLE_GUARD.ALL_GUARDS,
  notificationController.getNotifications,
);

notificationRouter.get(
  NOTIFICATION_PATHS.UNREAD_COUNT,
  ROLE_GUARD.ALL_GUARDS,
  notificationController.getUnreadCount,
);

notificationRouter.patch(
  NOTIFICATION_PATHS.MARK_READ,
  ROLE_GUARD.ALL_GUARDS,
  notificationController.markAsRead,
);

notificationRouter.patch(
  NOTIFICATION_PATHS.MARK_ALL_READ,
  ROLE_GUARD.ALL_GUARDS,
  notificationController.markAllAsRead,
);

export default notificationRouter;
