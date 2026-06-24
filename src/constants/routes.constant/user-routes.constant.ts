export const USER_ROUTES = {
  BASE: '/user',
  USER_PROFILE: '/user/user-profile',
  PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  PROFILE_PICTURE: '/user/profile-picture',

  STRIPE_WEBHOOK: '/user/stripe/webhook',
  GET_TRAINERS: '/user/trainers',
  GET_TRAINERS_BY_ID: '/user/trainers/:id',
  GET_CATEGORIES: '/user/categories',
  GET_EQUIPMENT: '/user/equipment',
  GET_CATEGORY_BY_ID: '/user/categories/:categoryId',
  GET_MEAL_CATEGORIES: '/user/meal-categories',

  GET_HEALTH_LOG: '/user/health-log',
  UPSERT_HEALTH_LOG: '/user/health-log',
  GET_HEALTH_LOG_PROGRESS: '/user/health-log/progress',

  //subscriptions

  GET_MY_SUBSCRIPTIONS: "/user/subscriptions",
  CHECKOUT_SESSION: "/user/checkout-session",
  VERIFY_PAYMENT: "/user/verify-payment",
  GET_ACTIVE_SUBSCRIPTION: "/user/active-subscription",
  GET_MY_TRANSACTIONS: "/user/transactions",


  CALCULATE_BMI_PUBLIC: "/user/bmi/calculate",

  // Exercises (premium)
  GET_EXERCISES: "/user/exercises",
  GET_EXERCISE_BY_ID: "/user/exercises/:exerciseId",

  //Workout plan
  GENERATE_WORKOUT: "/user/generate-workout",
  GET_WORKOUT_PLANS: "/user/workout-plans",
  MARK_WORKOUT_DAY: "/user/workout-plan/:planId/day/:dayNumber/complete",
  MARK_WORKOUT_EXERCISE: "/user/workout-plan/:planId/day/:dayNumber/exercise/:exerciseId/complete",
  GET_WORKOUT_PROGRESS: "/user/workout-progress",

  // Bookings
  GET_TRAINER_SLOTS: "/user/trainers/:id/slots",
  CREATE_BOOKING: "/user/bookings",
  GET_USER_BOOKINGS: "/user/bookings",
  CANCEL_BOOKING: "/user/bookings/:bookingId/cancel",
} as const;