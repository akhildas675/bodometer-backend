export const USER_ROUTES = {
  BASE: '/user',
  USER_PROFILE: '/user/user-profile',
  PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  PROFILE_PICTURE: '/user/profile-picture',
  GET_WORKOUTS: '/user/workouts',
  GET_WORKOUT_DETAIL: '/user/workouts/:id',
  GET_SUBSCRIPTIONS: '/user/subscriptions',
  GET_MY_SUBSCRIPTION: '/user/my-subscription',
  CREATE_CHECKOUT_SESSION: '/user/subscriptions/checkout',
  STRIPE_WEBHOOK: '/user/stripe/webhook',
  GET_TRAINERS: '/user/trainers',
  GET_TRAINERS_BY_ID:'/user/trainers/:id'
} as const;