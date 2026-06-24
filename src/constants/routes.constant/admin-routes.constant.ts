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


  //Subscription features
  GET_ALL_FEATURES: "/admin/get-subscription-features",
  GET_FEATURE_BY_ID: "/admin/get-subscription-feature/:id",
  CREATE_FEATURE: "/admin/create-subscription-feature",
  UPDATE_FEATURE: "/admin/update-subscription-feature/:id",
  TOGGLE_FEATURE_STATUS: "/admin/toggle-subscription-features/:id",

  //Subscription plans
  CREATE_SUBSCRIPTION_PLAN: "/admin/create-subscription-plan",
  GET_ALL_SUBSCRIPTION_PLANS: "/admin/get-subscription-plans",
  GET_SUBSCRIPTION_PLAN_BY_ID: "/admin/get-subscription-plan/:id",
  UPDATE_SUBSCRIPTION_PLAN: "/admin/update-subscription-plan/:id",
  TOGGLE_SUBSCRIPTION_PLAN_STATUS: "/admin/toggle-subscription-plan/:id",
  // Subscription Transactions
  GET_ALL_SUBSCRIPTION_TRANSACTIONS: "/admin/get-subscription-transactions",



  //Target Muscles

  CREATE_TARGET_MUSCLE: "/admin/create-target-muscle",
  GET_ALL_TARGET_MUSCLES: "/admin/get-target-muscles",
  GET_TARGET_MUSCLE_BY_ID: "/admin/get-target-muscle/:id",
  UPDATE_TARGET_MUSCLE: "/admin/update-target-muscle/:id",
  TOGGLE_TARGET_MUSCLE_STATUS: "/admin/toggle-target-muscle/:id",
  DELETE_TARGET_MUSCLE: "/admin/delete-target-muscle/:id",

  // Equipment
  CREATE_EQUIPMENT: "/admin/create-equipment",
  GET_ALL_EQUIPMENT: "/admin/get-equipment",
  GET_EQUIPMENT_BY_ID: "/admin/get-equipment/:id",
  UPDATE_EQUIPMENT: "/admin/update-equipment/:id",
  TOGGLE_EQUIPMENT_STATUS: "/admin/toggle-equipment/:id",

  // Exercises
  CREATE_EXERCISE: "/admin/create-exercise",
  GET_ALL_EXERCISES: "/admin/get-exercises",
  GET_EXERCISE_BY_ID: "/admin/get-exercise/:id",
  UPDATE_EXERCISE: "/admin/update-exercise/:id",
  TOGGLE_EXERCISE_STATUS: "/admin/toggle-exercise/:id",

  MEAL_CATEGORY_CREATE:"/admin/create-meal-category",
} as const;