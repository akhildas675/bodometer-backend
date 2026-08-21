export const FEATURE_TYPES = [
  "boolean",
  "limit"
] as const;

export type FeatureType =
  typeof FEATURE_TYPES[number];

  export const SUBSCRIPTION_STATUSES = [
  "active",
  "expired",
  "cancelled"
] as const;

export type SubscriptionStatus =
  typeof SUBSCRIPTION_STATUSES[number];



export const TRANSACTION_STATUSES = [
  "pending",
  "success",
  "failed",
  "refunded"
] as const;

export type TransactionStatus =
  typeof TRANSACTION_STATUSES[number];



export const PAYMENT_GATEWAYS = [
  "stripe",
  "razorpay",
  "manual"
] as const;

export type PaymentGateway =
  typeof PAYMENT_GATEWAYS[number];



export const LIMIT_TYPES = [
  "daily",
  "weekly",
  "monthly"
] as const;

export type LimitType =
  typeof LIMIT_TYPES[number];

export const TRANSACTION_TYPES = [
  "PURCHASE",
  "RENEWAL",
  "UPGRADE",
  "DOWNGRADE",
  "REFUND",
  "CANCELLATION",
] as const;

export type TransactionType =
  typeof TRANSACTION_TYPES[number];

