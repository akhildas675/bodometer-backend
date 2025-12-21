

export type Gender = "male" | "female" | "other" | "prefer_not_say";

export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  TRAINER: "trainer",
} as const;

export type UserRoles = typeof ROLES[keyof typeof ROLES];
