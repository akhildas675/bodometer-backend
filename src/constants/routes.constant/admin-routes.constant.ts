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
  UPDATE_CATEGORY: "/admin/update-category/:id",
  GET_CATEGORIES: "/admin/get-categories",
  GET_CATEGORY_BY_ID: "/admin/categories/:categoryId",
  DELETE_CATEGORY: "/admin/delete-category/:id",
  TOGGLE_CATEGORY_STATUS: "/admin/categories/:id/toggle",

} as const;