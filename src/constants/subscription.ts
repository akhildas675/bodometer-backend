export const PLAN_TYPES = {
  BASIC: "basic",
  PRO: "pro",
  ELITE: "elite",
} as const;

export type PlanType = (typeof PLAN_TYPES)[keyof typeof PLAN_TYPES];


export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  NONE: "none",
} as const;

export type SubscriptionStatus =
  typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];