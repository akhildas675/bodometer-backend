import { Router } from "express";
import container from "@/container/container";
import { FINANCE_TYPES } from "../finance.types";
import { FinanceController } from "../controller/finance.controller";
import { PayoutController } from "../controller/payout.controller";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { validate } from "@/middleware/validate";
import {
  chartQueryValidationSchema,
  completePayoutValidationSchema,
  failPayoutValidationSchema,
  payoutFilterValidationSchema,
  payoutIdParamSchema,
  processPayoutValidationSchema,
  rejectPayoutValidationSchema,
  requestPayoutValidationSchema,
  transactionFilterValidationSchema,
} from "../validation/finance.validation";

const financeController = container.get<FinanceController>(
  FINANCE_TYPES.FinanceController,
);
const payoutController = container.get<PayoutController>(
  FINANCE_TYPES.PayoutController,
);

const financeRoute = Router();

// ==========================================
// Trainer Finance & Payout Endpoints
// ==========================================
financeRoute.get(
  "/trainer/summary",
  ROLE_GUARD.TRAINER_GUARD,
  financeController.getTrainerSummary,
);
financeRoute.get(
  "/trainer/transactions",
  ROLE_GUARD.TRAINER_GUARD,
  validate(transactionFilterValidationSchema),
  financeController.getTrainerTransactions,
);
financeRoute.get(
  "/trainer/chart",
  ROLE_GUARD.TRAINER_GUARD,
  validate(chartQueryValidationSchema),
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
  validate(requestPayoutValidationSchema),
  payoutController.requestPayout,
);
financeRoute.get(
  "/trainer/payouts",
  ROLE_GUARD.TRAINER_GUARD,
  validate(payoutFilterValidationSchema),
  payoutController.getTrainerPayouts,
);
financeRoute.get(
  "/trainer/payouts/active",
  ROLE_GUARD.TRAINER_GUARD,
  payoutController.getTrainerActivePayout,
);
financeRoute.get(
  "/trainer/payouts/:id",
  ROLE_GUARD.TRAINER_GUARD,
  validate(payoutIdParamSchema),
  payoutController.getPayoutDetails,
);

// ==========================================
// Admin Platform Finance & Payout Management
// ==========================================
financeRoute.get(
  "/admin/summary",
  ROLE_GUARD.ADMIN_GUARD,
  financeController.getPlatformSummary,
);
financeRoute.get(
  "/admin/transactions",
  ROLE_GUARD.ADMIN_GUARD,
  validate(transactionFilterValidationSchema),
  financeController.getAllTransactions,
);
financeRoute.get(
  "/admin/chart",
  ROLE_GUARD.ADMIN_GUARD,
  validate(chartQueryValidationSchema),
  financeController.getAdminChart,
);
financeRoute.get(
  "/admin/payouts",
  ROLE_GUARD.ADMIN_GUARD,
  validate(payoutFilterValidationSchema),
  payoutController.getAllPayouts,
);
financeRoute.get(
  "/admin/payouts/summary",
  ROLE_GUARD.ADMIN_GUARD,
  payoutController.getAdminSummary,
);
financeRoute.get(
  "/admin/payouts/:id",
  ROLE_GUARD.ADMIN_GUARD,
  validate(payoutIdParamSchema),
  payoutController.getPayoutDetails,
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
  validate(rejectPayoutValidationSchema),
  payoutController.rejectPayout,
);
financeRoute.patch(
  "/admin/payouts/:id/process",
  ROLE_GUARD.ADMIN_GUARD,
  validate(processPayoutValidationSchema),
  payoutController.processPayout,
);
financeRoute.patch(
  "/admin/payouts/:id/complete",
  ROLE_GUARD.ADMIN_GUARD,
  validate(completePayoutValidationSchema),
  payoutController.completePayout,
);
financeRoute.patch(
  "/admin/payouts/:id/paid",
  ROLE_GUARD.ADMIN_GUARD,
  validate(completePayoutValidationSchema),
  payoutController.completePayout,
);
financeRoute.patch(
  "/admin/payouts/:id/fail",
  ROLE_GUARD.ADMIN_GUARD,
  validate(failPayoutValidationSchema),
  payoutController.failPayout,
);

// One-click: approve + pay via Stripe immediately
financeRoute.patch(
  "/admin/payouts/:id/stripe-pay",
  ROLE_GUARD.ADMIN_GUARD,
  validate(payoutIdParamSchema),
  payoutController.approveAndPayViaStripe,
);

export default financeRoute;
