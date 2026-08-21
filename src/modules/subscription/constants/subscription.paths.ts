export const SUBSCRIPTION_FEATURE_PATHS = {
  ROOT: "/features",
  BY_ID: "/features/:id",
  TOGGLE_STATUS: "/features/:id/toggle",
} as const;

export const SUBSCRIPTION_PLAN_PATHS = {
  ROOT: "/plans",
  BY_ID: "/plans/:id",
  TOGGLE_STATUS: "/plans/:id/toggle",

  ACTIVE: "/my-subscription",
  TRANSACTIONS: "/transactions",
  USER_TRANSACTIONS: "/user/transactions",

  CHECKOUT_SESSION: "/checkout-session",
  VERIFY_PAYMENT: "/verify-payment",

  UPGRADE_PREVIEW: "/upgrade-preview/:targetPlanId",
  UPGRADE_CHECKOUT: "/upgrade-checkout",
} as const;
