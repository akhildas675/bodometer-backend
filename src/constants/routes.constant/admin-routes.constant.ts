export const ADMIN_ROUTES = {
  BASE: '/admin',
  
  // tser Management
  GET_USERS: '/admin/get-users',
  BLOCK_USER: '/admin/users/:userId/block',
  UNBLOCK_USER: '/admin/users/:userId/unblock',
  
  // trainer Management
  GET_TRAINERS: '/admin/get-trainers',
  BLOCK_TRAINER: '/admin/trainer/:trainerId/block',
  UNBLOCK_TRAINER: '/admin/trainer/:trainerId/unblock',
  GET_TRAINER_BY_ID: '/admin/trainers/profile/:profileId',
  APPROVE_TRAINER: '/admin/trainers/:profileId/approve',
  REJECT_TRAINER: '/admin/trainers/:profileId/reject',
  
  // workout Management
  ADD_WORKOUT: '/admin/add-workout',
  GET_WORKOUTS: '/admin/get-workouts',
  
  //appointment Management
  GET_TRAINER_APPOINTMENTS: '/admin/get-trainer-appointments',
} as const;