export const PLAN_TYPES = {
  BASIC: "basic",
  PRO: "pro",
  ELITE: "elite",
} as const;

export type PlanType = (typeof PLAN_TYPES)[keyof typeof PLAN_TYPES];