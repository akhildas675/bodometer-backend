import { NOTIFICATION_TYPE, NotificationType } from "./notification.constant";


export interface NotificationTemplate {
  title: string;
  message: string;
}

export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  NotificationTemplate
> = {

  // BOOKING


  [NOTIFICATION_TYPE.BOOKING_CONFIRMED]: {
    title: "Booking Confirmed",
    message:
      "Hi {{userName}}, your session with {{trainerName}} has been confirmed for {{scheduledDate}} at {{scheduledTime}}.",
  },

  [NOTIFICATION_TYPE.NEW_BOOKING_RECEIVED]: {
    title: "New Booking Received",
    message:
      "Hi {{trainerName}}, {{userName}} has booked a {{serviceName}} session with you for {{scheduledDate}} at {{scheduledTime}}.",
  },

  [NOTIFICATION_TYPE.BOOKING_CANCELLED]: {
    title: "Booking Cancelled",
    message:
      "Hi {{userName}}, your session with {{trainerName}} scheduled for {{scheduledDate}} at {{scheduledTime}} has been cancelled.",
  },

  [NOTIFICATION_TYPE.BOOKING_COMPLETED]: {
    title: "Session Completed",
    message:
      "Hi {{userName}}, your session with {{trainerName}} has been completed. You can now rate your experience.",
  },

  [NOTIFICATION_TYPE.BOOKING_REJECTED]: {
    title: "Booking Rejected",
    message:
      "Hi {{userName}}, your booking request with {{trainerName}} for {{scheduledDate}} at {{scheduledTime}} was rejected.",
  },


  // RESCHEDULE


  [NOTIFICATION_TYPE.RESCHEDULE_PROPOSED]: {
    title: "Reschedule Request",
    message:
      "{{trainerName}} has proposed rescheduling your session from {{oldDate}} at {{oldTime}} to {{newDate}} at {{newTime}}.",
  },

  [NOTIFICATION_TYPE.RESCHEDULE_REQUEST_RECEIVED]: {
    title: "Reschedule Request Received",
    message:
      "Hi {{trainerName}}, {{userName}} has requested to reschedule their session from {{oldDate}} at {{oldTime}} to {{newDate}} at {{newTime}}.",
  },

  [NOTIFICATION_TYPE.RESCHEDULE_ACCEPTED]: {
    title: "Reschedule Accepted",
    message:
      "Hi {{userName}}, your session with {{trainerName}} has been rescheduled successfully to {{scheduledDate}} at {{scheduledTime}}.",
  },

  [NOTIFICATION_TYPE.RESCHEDULE_REJECTED]: {
    title: "Reschedule Rejected",
    message:
      "Hi {{userName}}, the reschedule request from {{trainerName}} was rejected. Your original booking remains unchanged.",
  },


  // SESSION


  [NOTIFICATION_TYPE.SESSION_REMINDER]: {
    title: "Upcoming Session",
    message:
      "Hi {{userName}}, your session with {{trainerName}} is scheduled for {{scheduledDate}} at {{scheduledTime}}.",
  },

  [NOTIFICATION_TYPE.SESSION_STARTING_SOON]: {
    title: "Session Starting Soon",
    message:
      "Hi {{userName}}, your session with {{trainerName}} starts in {{minutesRemaining}} minutes.",
  },


  // PAYMENT


  [NOTIFICATION_TYPE.PAYMENT_SUCCESSFUL]: {
    title: "Payment Successful",
    message:
      "Hi {{userName}}, your payment of {{amount}} {{currency}} for {{purpose}} was completed successfully.",
  },

  [NOTIFICATION_TYPE.PAYMENT_FAILED]: {
    title: "Payment Failed",
    message:
      "Hi {{userName}}, your payment of {{amount}} {{currency}} for {{purpose}} failed. Please try again.",
  },

  [NOTIFICATION_TYPE.PAYMENT_ISSUE]: {
    title: "Payment Issue",
    message:
      "A payment issue requires attention for {{userName}}. Transaction ID: {{transactionId}}.",
  },


  // SUBSCRIPTION


  [NOTIFICATION_TYPE.SUBSCRIPTION_PURCHASED]: {
    title: "Subscription Activated",
    message:
      "Hi {{userName}}, your {{planName}} subscription has been activated successfully and is valid until {{endDate}}.",
  },

  [NOTIFICATION_TYPE.SUBSCRIPTION_RENEWED]: {
    title: "Subscription Renewed",
    message:
      "Hi {{userName}}, your {{planName}} subscription has been renewed successfully and is active until {{endDate}}.",
  },

  [NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRING_SOON]: {
    title: "Subscription Expiring Soon",
    message:
      "Hi {{userName}}, your {{planName}} subscription will expire on {{expiryDate}}. Renew it to continue using premium features.",
  },

  [NOTIFICATION_TYPE.SUBSCRIPTION_EXPIRED]: {
    title: "Subscription Expired",
    message:
      "Hi {{userName}}, your {{planName}} subscription expired on {{expiryDate}}. Renew your subscription to continue using premium features.",
  },

  [NOTIFICATION_TYPE.SUBSCRIPTION_CANCELLED]: {
    title: "Subscription Cancelled",
    message:
      "Hi {{userName}}, your {{planName}} subscription has been cancelled.",
  },


  // TRAINER


  [NOTIFICATION_TYPE.TRAINER_APPLICATION_SUBMITTED]: {
    title: "Trainer Application Submitted",
    message:
      "Hi {{userName}}, your trainer application has been submitted successfully and is waiting for admin review.",
  },

  [NOTIFICATION_TYPE.TRAINER_APPROVED]: {
    title: "Trainer Application Approved",
    message:
      "Hi {{userName}}, your trainer application has been approved. You can now start accepting bookings.",
  },

  [NOTIFICATION_TYPE.TRAINER_REJECTED]: {
    title: "Trainer Application Rejected",
    message:
      "Hi {{userName}}, your trainer application has been rejected. Please review the provided feedback.",
  },

  [NOTIFICATION_TYPE.TRAINER_PROFILE_UPDATE_REQUIRED]: {
    title: "Trainer Profile Update Required",
    message:
      "Hi {{userName}}, your trainer profile requires an update. Please review the requested changes.",
  },

  [NOTIFICATION_TYPE.NEW_TRAINER_APPLICATION]: {
    title: "New Trainer Application",
    message:
      "{{trainerName}} has submitted a new trainer application and is waiting for verification.",
  },


  // REFUND


  [NOTIFICATION_TYPE.REFUND_PROCESSED]: {
    title: "Refund Processed",
    message:
      "Hi {{userName}}, your refund of {{amount}} {{currency}} has been credited to your Bodometer wallet.",
  },

  [NOTIFICATION_TYPE.REFUND_REQUIRES_PROCESSING]: {
    title: "Refund Requires Processing",
    message:
      "A refund of {{amount}} {{currency}} for {{userName}} requires processing.",
  },


  // WALLET


  [NOTIFICATION_TYPE.WALLET_CREDITED]: {
    title: "Wallet Credited",
    message:
      "Hi {{userName}}, {{amount}} {{currency}} has been credited to your Bodometer wallet.",
  },

  [NOTIFICATION_TYPE.WALLET_PAYMENT_SUCCESSFUL]: {
    title: "Wallet Payment Successful",
    message:
      "Hi {{userName}}, {{amount}} {{currency}} has been deducted from your wallet for {{purpose}}.",
  },


  // WORKOUT


  [NOTIFICATION_TYPE.WORKOUT_PLAN_GENERATED]: {
    title: "Workout Plan Ready",
    message:
      "Hi {{userName}}, your {{workoutType}} workout plan has been generated and is ready to use.",
  },

  [NOTIFICATION_TYPE.NEW_WORKOUT_ASSIGNED]: {
    title: "New Workout Assigned",
    message:
      "Hi {{userName}}, a new {{workoutName}} workout has been assigned to you.",
  },

  [NOTIFICATION_TYPE.WORKOUT_PLAN_UPDATED]: {
    title: "Workout Plan Updated",
    message:
      "Hi {{userName}}, your workout plan has been updated. Check your latest plan for the changes.",
  },

  [NOTIFICATION_TYPE.WORKOUT_REMINDER]: {
    title: "Workout Reminder",
    message:
      "Hi {{userName}}, it's time for your {{workoutName}} workout.",
  },

  [NOTIFICATION_TYPE.WORKOUT_MISSED]: {
    title: "Workout Missed",
    message:
      "Hi {{userName}}, you missed your {{workoutName}} workout scheduled for {{scheduledDate}}.",
  },

  [NOTIFICATION_TYPE.WORKOUT_COMPLETED]: {
    title: "Workout Completed",
    message:
      "Hi {{userName}}, you completed your {{workoutName}} workout. Keep up your progress.",
  },


  // MEAL / DAILY ROUTINE


  [NOTIFICATION_TYPE.MEAL_PLAN_GENERATED]: {
    title: "Meal Plan Ready",
    message:
      "Hi {{userName}}, your new meal plan has been generated and is ready to follow.",
  },

  [NOTIFICATION_TYPE.MEAL_PLAN_UPDATED]: {
    title: "Meal Plan Updated",
    message:
      "Hi {{userName}}, your meal plan has been updated. Check your latest plan for the changes.",
  },

  [NOTIFICATION_TYPE.MEAL_REMINDER]: {
    title: "Meal Reminder",
    message:
      "Hi {{userName}}, it's time for your {{mealType}} meal.",
  },

  [NOTIFICATION_TYPE.DAILY_ROUTINE_REMINDER]: {
    title: "Daily Routine Reminder",
    message:
      "Hi {{userName}}, don't forget to complete your daily health and fitness routine.",
  },

  [NOTIFICATION_TYPE.HYDRATION_REMINDER]: {
    title: "Hydration Reminder",
    message:
      "Hi {{userName}}, it's time to drink water and stay hydrated.",
  },

  [NOTIFICATION_TYPE.SLEEP_REMINDER]: {
    title: "Sleep Reminder",
    message:
      "Hi {{userName}}, don't forget to maintain your planned sleep schedule.",
  },

  [NOTIFICATION_TYPE.HEALTH_LOG_REMINDER]: {
    title: "Health Log Reminder",
    message:
      "Hi {{userName}}, don't forget to update your daily health metrics.",
  },


  // RATING / FEEDBACK


  [NOTIFICATION_TYPE.RATING_REMINDER]: {
    title: "Rate Your Session",
    message:
      "Hi {{userName}}, how was your session with {{trainerName}}? Take a moment to rate your experience.",
  },

  [NOTIFICATION_TYPE.RATING_RECEIVED]: {
    title: "New Rating Received",
    message:
      "Hi {{trainerName}}, {{userName}} rated your session {{rating}} out of 5.",
  },

  [NOTIFICATION_TYPE.FEEDBACK_RECEIVED]: {
    title: "New Feedback Received",
    message:
      "Hi {{trainerName}}, {{userName}} has submitted feedback for your session.",
  },

  [NOTIFICATION_TYPE.NEW_REVIEW]: {
    title: "New Review Received",
    message:
      "Hi {{trainerName}}, {{userName}} has submitted a new review for your service.",
  },


  // CHAT


  [NOTIFICATION_TYPE.NEW_MESSAGE]: {
    title: "New Message",
    message:
      "Hi {{userName}}, you have a new message from {{senderName}}.",
  },


  // PAYOUT


  [NOTIFICATION_TYPE.PAYOUT_PROCESSED]: {
    title: "Payout Processed",
    message:
      "Hi {{trainerName}}, your payout of {{amount}} {{currency}} has been processed successfully.",
  },
};