export const ADMIN_ROUTES = {
  BASE: '/admin',

  // User Management
  GET_USERS: '/admin/get-users',
  BLOCK_USER: '/admin/users/:userId/block',
  UNBLOCK_USER: '/admin/users/:userId/unblock',

  // Trainer Management
  GET_TRAINERS: '/admin/get-trainers',
  BLOCK_TRAINER: '/admin/trainer/:trainerId/block',
  UNBLOCK_TRAINER: '/admin/trainer/:trainerId/unblock',
  GET_TRAINER_BY_ID: '/admin/trainers/profile/:profileId',
  APPROVE_TRAINER: '/admin/trainers/:profileId/approve',
  REJECT_TRAINER: '/admin/trainers/:profileId/reject',

  // Appointment Management
  GET_TRAINER_APPOINTMENTS: '/admin/get-trainer-appointments',

  CREATE_CATEGORY: "/admin/create-category",
  UPDATE_CATEGORY: "/update-category/:id",
  GET_CATEGORY_BY_ID: "/get-category-by-id/:id",
  GET_ALL_CATEGORIES: "/admin/get-all-categories",
  TOGGLE_CATEGORY_STATUS: "/toggle-category-status/:id",

  //Subscription features
  GET_ALL_FEATURES: "/admin/get-subscription-features",
  GET_FEATURE_BY_ID: "/admin/get-subscription-feature/:id",
  CREATE_FEATURE: "/admin/create-subscription-feature",
  UPDATE_FEATURE: "/admin/update-subscription-feature/:id",
  TOGGLE_FEATURE_STATUS: "/admin/subscription-feature/:id",

  //Subscription plans
  CREATE_SUBSCRIPTION_PLAN: "/admin/create-subscription-plan",
  GET_ALL_SUBSCRIPTION_PLANS: "/admin/get-subscription-plans",
  GET_SUBSCRIPTION_PLAN_BY_ID: "/admin/get-subscription-plan/:id",
  UPDATE_SUBSCRIPTION_PLAN: "/admin/update-subscription-plan/:id",
  TOGGLE_SUBSCRIPTION_PLAN_STATUS: "/admin/toggle-subscription-plan/:id",


} as const;