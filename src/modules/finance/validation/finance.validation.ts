import { z } from "zod";

export const transactionFilterSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100, "Limit must not exceed 100").optional(),
    transactionType: z.enum(["CREDIT", "DEBIT"]).optional(),
    status: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

export const chartQuerySchema = z.object({
  query: z.object({
    period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});
