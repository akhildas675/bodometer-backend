export * from "./auth.messages";
export * from "./user.messages";
export * from "./trainer.messages";
export * from "./admin.messages";
export * from "./workout.messages";
export * from "@/modules/subscription/constants/subscription.messages";
export * from "./common.messages";
export * from "./health-log.messages";
export * from "./notification.messages";
export * from "./video-call.messages";

import { AUTH_MESSAGES } from "./auth.messages";
import { USER_MESSAGES } from "./user.messages";
import { TRAINER_MESSAGES } from "./trainer.messages";
import { ADMIN_MESSAGES } from "./admin.messages";
import { WORKOUT_MESSAGES } from "./workout.messages";
import { SUBSCRIPTION_MESSAGES } from "@/modules/subscription/constants/subscription.messages";
import { COMMON_MESSAGES } from "./common.messages";
import { HEALTH_LOG_MESSAGES } from "./health-log.messages";
import { CATEGORY_MESSAGES } from "./category.message";
import { BOOKING_MESSAGES } from "./booking.messages";
import { NOTIFICATION_MESSAGES } from "./notification.messages";
import { VIDEO_CALL_MESSAGES } from "./video-call.messages";

export const MESSAGES = {
  ...AUTH_MESSAGES,
  ...USER_MESSAGES,
  ...TRAINER_MESSAGES,
  ...ADMIN_MESSAGES,
  ...WORKOUT_MESSAGES,
  ...SUBSCRIPTION_MESSAGES,
  ...COMMON_MESSAGES,
  ...HEALTH_LOG_MESSAGES,
  ...CATEGORY_MESSAGES,
  ...BOOKING_MESSAGES,
  ...NOTIFICATION_MESSAGES,
  ...VIDEO_CALL_MESSAGES,
};
