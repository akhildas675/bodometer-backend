export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  TRAINER: "trainer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
