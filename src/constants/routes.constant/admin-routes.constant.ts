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
  
  // Workout Management
  ADD_WORKOUT: '/admin/add-workout',
  GET_WORKOUTS: '/admin/get-workouts',
  
  // Appointment Management
  GET_TRAINER_APPOINTMENTS: '/admin/get-trainer-appointments',

  // Subscription Management
  ADD_SUBSCRIPTION: '/admin/add-subscription',
  GET_ALL_SUBSCRIPTIONS: '/admin/subscriptions',
  GET_SUBSCRIPTION_BY_ID: (id: string) => `/admin/subscriptions/${id}`,
  UPDATE_SUBSCRIPTION: (id: string) => `/admin/subscriptions/${id}`,
  DELETE_SUBSCRIPTION: (id: string) => `/admin/subscriptions/${id}`,
  TOGGLE_SUBSCRIPTION_STATUS: (id: string) => `/admin/subscriptions/${id}/toggle`,
} as const;