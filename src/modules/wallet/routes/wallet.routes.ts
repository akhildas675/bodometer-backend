import container from "@/container/container";
import { Router } from "express";

import { WalletController } from "../controller/wallet.controller";
import { WALLET_TYPES } from "../wallet.types";

import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";

import { validate } from "@/middleware/validate";

import {
  walletTransactionsQuerySchema,
  addFundsSchema,
  createTopupCheckoutSchema,
  verifyTopupPaymentSchema,
} from "../validation/wallet.validation";


const walletRoute = Router();

const walletController =
  container.get<WalletController>(
    WALLET_TYPES.WalletController,
  );


walletRoute.get(
  "/balance",
  ROLE_GUARD.USER_GUARD,
  walletController.getWallet,
);


walletRoute.get(
  "/history",
  ROLE_GUARD.USER_GUARD,
  validate(walletTransactionsQuerySchema),
  walletController.getTransactions,
);


walletRoute.post(
  "/add-funds",
  ROLE_GUARD.USER_GUARD,
  validate(addFundsSchema),
  walletController.addFunds,
);


walletRoute.post(
  "/create-checkout",
  ROLE_GUARD.USER_GUARD,
  validate(createTopupCheckoutSchema),
  walletController.createTopupCheckout,
);


walletRoute.post(
  "/verify-topup",
  ROLE_GUARD.USER_GUARD,
  validate(verifyTopupPaymentSchema),
  walletController.verifyTopupPayment,
);


export default walletRoute;