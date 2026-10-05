import { z } from "zod";

export const requestPayoutSchema = z.object({
  body: z.object({
    amount: z.number().min(1, "Amount must be at least 1").max(10000, "Amount must not exceed 10000"),
  }),
});

export const rejectPayoutSchema = z.object({
  params: z.object({
    payoutId: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    reason: z.string().min(1, "Rejection reason is required").max(500, "Reason must not exceed 500 characters"),
  }),
});

export const processPayoutSchema = z.object({
  params: z.object({
    payoutId: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    providerPayoutId: z.string().max(200, "Provider payout ID too long").optional(),
  }),
});

export const completePayoutSchema = z.object({
  params: z.object({
    payoutId: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    providerPayoutId: z.string().max(200, "Provider payout ID too long").optional(),
  }),
});

export const failPayoutSchema = z.object({
  params: z.object({
    payoutId: z.string().min(1, "Payout ID is required"),
  }),
  body: z.object({
    reason: z.string().min(1, "Failure reason is required").max(500, "Reason must not exceed 500 characters"),
  }),
});

export const payoutFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const payoutIdParamSchema = z.object({
  params: z.object({
    payoutId: z.string().min(1, "Payout ID is required"),
  }),
});
