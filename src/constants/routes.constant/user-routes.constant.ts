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
  GET_CATEGORY_BY_ID: '/user/categories/:id',

  //subscriptions

  GET_MY_SUBSCRIPTIONS: "/user/subscriptions",
  CHECKOUT_SESSION: "/user/checkout-session",
  VERIFY_PAYMENT: "/user/verify-payment",
  GET_ACTIVE_SUBSCRIPTION: "/user/active-subscription",

} as const;