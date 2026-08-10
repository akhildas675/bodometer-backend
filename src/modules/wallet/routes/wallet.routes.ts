import { Router } from "express";
import container from "@/container/container";
import { WALLET_TYPES } from "../wallet.types";
import { WalletController } from "../controller/wallet.controller";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";

const walletController = container.get<WalletController>(WALLET_TYPES.WalletController);
const walletRoute = Router();

walletRoute.get("/balance", ROLE_GUARD.USER_GUARD, walletController.getWallet);
walletRoute.get("/history", ROLE_GUARD.USER_GUARD, walletController.getTransactions);
walletRoute.post("/add-funds", ROLE_GUARD.USER_GUARD, walletController.addFunds);
walletRoute.post("/create-checkout", ROLE_GUARD.USER_GUARD, walletController.createTopupCheckout);
walletRoute.post("/verify-topup", ROLE_GUARD.USER_GUARD, walletController.verifyTopupPayment);

export default walletRoute;
