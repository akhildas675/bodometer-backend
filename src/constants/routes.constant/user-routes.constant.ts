export const USER_ROUTES = {
  BASE: '/user',
  USER_PROFILE: '/user/user-profile',
  PROFILE: '/user/profile',
  CHANGE_PASSWORD: '/user/change-password',
  PROFILE_PICTURE: '/user/profile-picture',

  STRIPE_WEBHOOK: '/user/stripe/webhook',
  GET_TRAINERS: '/user/trainers',
  GET_TRAINERS_BY_ID:'/user/trainers/:id',
 

} as const;