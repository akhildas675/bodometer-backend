import { Router } from "express";
import container from "@/container/container";
import { FINANCE_TYPES } from "../finance.types";
import { FinanceController } from "../controller/finance.controller";
import { PayoutController } from "../controller/payout.controller";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { validate } from "@/middleware/validate";
import {
  chartQuerySchema,
  transactionFilterSchema,
} from "../validation/finance.validation";
import {
  completePayoutSchema,
  failPayoutSchema,
  payoutFilterSchema,
  payoutIdParamSchema,
  processPayoutSchema,
  rejectPayoutSchema,
  requestPayoutSchema,
} from "../validation/payout.validation";

const financeController = container.get<FinanceController>(
  FINANCE_TYPES.FinanceController,
);

const payoutController = container.get<PayoutController>(
  FINANCE_TYPES.PayoutController,
);

const financeRoute = Router();

// TRAINER 

financeRoute.get(
  "/trainer/summary",
  ROLE_GUARD.TRAINER_GUARD,
  financeController.getTrainerSummary,
);

financeRoute.get(
  "/trainer/transactions",
  ROLE_GUARD.TRAINER_GUARD,
  validate(transactionFilterSchema),
  financeController.getTrainerTransactions,
);

financeRoute.get(
  "/trainer/chart",
  ROLE_GUARD.TRAINER_GUARD,
  validate(chartQuerySchema),
  financeController.getTrainerChart,
);

financeRoute.get(
  "/trainer/balance",
  ROLE_GUARD.TRAINER_GUARD,
  payoutController.getTrainerAvailableBalance,
);

financeRoute.post(
  "/trainer/payouts",
  ROLE_GUARD.TRAINER_GUARD,
  validate(requestPayoutSchema),
  payoutController.requestPayout,
);

financeRoute.get(
  "/trainer/payouts",
  ROLE_GUARD.TRAINER_GUARD,
  validate(payoutFilterSchema),
  payoutController.getTrainerPayouts,
);

financeRoute.get(
  "/trainer/payouts/active",
  ROLE_GUARD.TRAINER_GUARD,
  payoutController.getTrainerActivePayout,
);

//  ADMIN 

financeRoute.get(
  "/admin/summary",
  ROLE_GUARD.ADMIN_GUARD,
  financeController.getPlatformSummary,
);

financeRoute.get(
  "/admin/transactions",
  ROLE_GUARD.ADMIN_GUARD,
  validate(transactionFilterSchema),
  financeController.getAllTransactions,
);

financeRoute.get(
  "/admin/chart",
  ROLE_GUARD.ADMIN_GUARD,
  validate(chartQuerySchema),
  financeController.getAdminChart,
);

financeRoute.get(
  "/admin/payouts",
  ROLE_GUARD.ADMIN_GUARD,
  validate(payoutFilterSchema),
  payoutController.getAllPayouts,
);

financeRoute.get(
  "/admin/payouts/summary",
  ROLE_GUARD.ADMIN_GUARD,
  payoutController.getAdminSummary,
);

financeRoute.patch(
  "/admin/payouts/:id/approve",
  ROLE_GUARD.ADMIN_GUARD,
  validate(payoutIdParamSchema),
  payoutController.approvePayout,
);

financeRoute.patch(
  "/admin/payouts/:id/reject",
  ROLE_GUARD.ADMIN_GUARD,
  validate(rejectPayoutSchema.merge(payoutIdParamSchema)),
  payoutController.rejectPayout,
);

financeRoute.patch(
  "/admin/payouts/:id/process",
  ROLE_GUARD.ADMIN_GUARD,
  validate(processPayoutSchema.merge(payoutIdParamSchema)),
  payoutController.processPayout,
);

financeRoute.patch(
  "/admin/payouts/:id/complete",
  ROLE_GUARD.ADMIN_GUARD,
  validate(completePayoutSchema.merge(payoutIdParamSchema)),
  payoutController.completePayout,
);

financeRoute.patch(
  "/admin/payouts/:id/fail",
  ROLE_GUARD.ADMIN_GUARD,
  validate(failPayoutSchema.merge(payoutIdParamSchema)),
  payoutController.failPayout,
);

export default financeRoute;