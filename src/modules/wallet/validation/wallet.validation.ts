import { z } from "zod";

import {
  WALLET_TRANSACTION_TYPE,
} from "../constants/wallet.constants";


export const walletTransactionsQuerySchema =
  z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    limit: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    type: z
      .union([
        z.nativeEnum(WALLET_TRANSACTION_TYPE),
        z.literal("ALL"),
      ])
      .optional(),

    search: z
      .string()
      .trim()
      .optional(),

    sortBy: z
      .enum([
        "createdAt",
        "amount",
      ])
      .optional(),

    sortOrder: z
      .enum([
        "asc",
        "desc",
      ])
      .optional(),
  });


export const addFundsSchema = z.object({
  amount: z.coerce
    .number()
    .positive()
    .max(10000, "Amount must not exceed 10000"),
});


export const createTopupCheckoutSchema =
  z.object({
    amount: z.coerce
      .number()
      .positive()
      .max(10000, "Amount must not exceed 10000"),
  });


export const verifyTopupPaymentSchema =
  z.object({
    amount: z.coerce
      .number()
      .positive()
      .max(10000, "Amount must not exceed 10000"),

    sessionId: z
      .string()
      .trim()
      .min(1)
      .max(200, "Session ID too long"),
  });