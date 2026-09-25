import { z } from "zod";
import {
  PAYOUT_CONFIG,
  PAYOUT_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../constant/finance.constant";

export const requestPayoutValidationSchema = z.object({
  body: z.object({
    amount: z
      .number({
        error: "Payout amount is required and must be a number",
      })
      .min(
        PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT,
        `Minimum payout amount is ₹${PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT}`,
      ),
    bankDetails: z
      .object({
        accountHolderName: z.string().trim().optional(),
        accountNumber: z.string().trim().optional(),
        ifscCode: z.string().trim().optional(),
        bankName: z.string().trim().optional(),
        upiId: z.string().trim().optional(),
      })
      .optional(),
  }),
});

export const payoutIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payout ID is required"),
  }),
});

export const rejectPayoutValidationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    reason: z
      .string({
        error: "Rejection reason is required",
      })
      .trim()
      .min(3, "Rejection reason must be at least 3 characters"),
  }),
});

export const processPayoutValidationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payout ID is required"),
  }),
  body: z
    .object({
      providerPayoutId: z.string().trim().optional(),
      adminNote: z.string().trim().optional(),
    })
    .optional(),
});

export const completePayoutValidationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    bankTransferReference: z
      .string({
        error: "Bank transfer reference / UTR is required",
      })
      .trim()
      .min(1, "Bank transfer reference cannot be empty"),
    transferredAt: z.union([z.string(), z.date()]).optional(),
    adminNote: z.string().trim().optional(),
    payoutMethod: z.string().trim().optional(),
    providerPayoutId: z.string().trim().optional(),
  }),
});

export const failPayoutValidationSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    reason: z
      .string({
        error: "Failure reason is required",
      })
      .trim()
      .min(3, "Failure reason must be at least 3 characters"),
  }),
});

export const payoutFilterValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    status: z.enum(Object.values(PAYOUT_STATUS) as [string, ...string[]]).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const transactionFilterValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    transactionType: z
      .enum(Object.values(TRANSACTION_TYPE) as [string, ...string[]])
      .optional(),
    status: z
      .enum(Object.values(TRANSACTION_STATUS) as [string, ...string[]])
      .optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const chartQueryValidationSchema = z.object({
  query: z.object({
    period: z.enum(["daily", "weekly", "monthly"]).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});
