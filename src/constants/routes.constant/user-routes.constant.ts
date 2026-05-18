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
  GET_CATEGORY_BY_ID: '/user/categories/:categoryId',

  //subscriptions

  GET_MY_SUBSCRIPTIONS: "/user/subscriptions",
  CHECKOUT_SESSION: "/user/checkout-session",
  VERIFY_PAYMENT: "/user/verify-payment",
  GET_ACTIVE_SUBSCRIPTION: "/user/active-subscription",
  GET_MY_TRANSACTIONS: "/user/transactions",

  // onboarding
  GET_ONBOARDING_GROUPS: "/user/onboarding-groups",
  GET_ONBOARDING_QUESTIONS: "/user/onboarding-questions",
  SUBMIT_ONBOARDING: "/user/submit-onboarding",
  GET_ONBOARDING_STATUS: "/user/onboarding-status",
  GET_ONBOARDING_ANSWERS: "/user/onboarding-answers",
  CALCULATE_BMI_PUBLIC: "/user/bmi/calculate",
} as const;