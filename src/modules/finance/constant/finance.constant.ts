export const TRANSACTION_TYPE = {
  SESSION_EARNING: "SESSION_EARNING",
  REFUND: "REFUND",
  PAYOUT: "PAYOUT",
  ADJUSTMENT: "ADJUSTMENT",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];



export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REVERSED: "REVERSED",
} as const;

export type TransactionStatus =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];



export const PAYOUT_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PROCESSING: "PROCESSING",
  PAID: "PAID",
  FAILED: "FAILED",
} as const;

export type PayoutStatus =
  (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];



export const PAYOUT_METHOD = {
  MANUAL_BANK_TRANSFER: "MANUAL_BANK_TRANSFER",
  STRIPE: "STRIPE",
} as const;

export type PayoutMethod =
  (typeof PAYOUT_METHOD)[keyof typeof PAYOUT_METHOD];

export const VALID_PAYOUT_TRANSITIONS: Record<PayoutStatus, PayoutStatus[]> = {
  [PAYOUT_STATUS.PENDING]: [PAYOUT_STATUS.APPROVED, PAYOUT_STATUS.REJECTED],
  [PAYOUT_STATUS.APPROVED]: [PAYOUT_STATUS.PROCESSING],
  [PAYOUT_STATUS.PROCESSING]: [PAYOUT_STATUS.PAID, PAYOUT_STATUS.FAILED],
  [PAYOUT_STATUS.PAID]: [],
  [PAYOUT_STATUS.REJECTED]: [],
  [PAYOUT_STATUS.FAILED]: [],
};

export const isValidPayoutTransition = (
  currentStatus: PayoutStatus,
  targetStatus: PayoutStatus,
): boolean => {
  const allowed = VALID_PAYOUT_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
};

export const COMMISSION_DEFAULTS = {
  TRAINER_PERCENTAGE: 70,
  PLATFORM_PERCENTAGE: 30,
} as const;

export const PAYOUT_CONFIG = {
  MINIMUM_PAYOUT_AMOUNT: 100, // ₹1,000 minimum
  DEFAULT_CURRENCY: "INR",
} as const;

export const FINANCE_CURRENCY = {
  INR: "INR",
} as const;

export type FinanceCurrency =
  (typeof FINANCE_CURRENCY)[keyof typeof FINANCE_CURRENCY];
