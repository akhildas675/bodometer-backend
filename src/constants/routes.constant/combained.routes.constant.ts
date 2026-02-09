import { ADMIN_ROUTES } from "./admin-routes.constant";
import { AUTH_ROUTES } from "./auth-routes.constant";
import { TRAINER_ROUTES } from "./trainer-routes.constant";
import { USER_ROUTES } from "./user-routes.constant";

export const API_ROUTES = {
  BASE: '/api',
  AUTH: AUTH_ROUTES,
  ADMIN: ADMIN_ROUTES,
  USER: USER_ROUTES,
  TRAINER: TRAINER_ROUTES,
} as const;