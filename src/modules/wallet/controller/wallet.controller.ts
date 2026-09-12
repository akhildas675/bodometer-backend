import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { AppError } from "@/utils/appError";
import { WALLET_TYPES } from "../wallet.types";
import { IWalletService } from "../services/wallet.service";

@injectable()
export class WalletController {
  constructor(
    @inject(WALLET_TYPES.WalletService)
    private _walletService: IWalletService,
  ) {}

  getWallet = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "User authentication required.");
      }

      const wallet = await this._walletService.getOrCreateWallet(userId);
      new SuccessResponse(STATUS.OK, "Wallet balance retrieved successfully.", wallet).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "User authentication required.");
      }

      const transactions = await this._walletService.getTransactions(userId);
      new SuccessResponse(STATUS.OK, "Wallet transactions retrieved successfully.", transactions).send(res);
    } catch (error) {
      next(error);
    }
  };

  addFunds = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const body = req.body as { amount?: unknown };
      const amount = body.amount;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "User authentication required.");
      }

      const numAmount = Number(amount);
      if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw new AppError(STATUS.BAD_REQUEST, "Please enter a valid positive amount to add.");
      }

      const result = await this._walletService.topUpWallet(userId, numAmount);
      new SuccessResponse(STATUS.OK, "Wallet funds added successfully.", result).send(res);
    } catch (error) {
      next(error);
    }
  };

  createTopupCheckout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const body = req.body as { amount?: unknown };
      const amount = body.amount;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "User authentication required.");
      }

      const numAmount = Number(amount);
      if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw new AppError(STATUS.BAD_REQUEST, "Please enter a valid positive amount.");
      }

      const result = await this._walletService.createTopupCheckoutSession(userId, numAmount);
      new SuccessResponse(STATUS.OK, "Top-up payment checkout session created.", result).send(res);
    } catch (error) {
      next(error);
    }
  };

  verifyTopupPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const body = req.body as { amount?: unknown; sessionId?: string };
      const { amount, sessionId } = body;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "User authentication required.");
      }

      const numAmount = Number(amount);
      if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
        throw new AppError(STATUS.BAD_REQUEST, "Invalid top-up amount.");
      }

      if (!sessionId || typeof sessionId !== "string") {
        throw new AppError(STATUS.BAD_REQUEST, "Valid sessionId is required.");
      }

      const result = await this._walletService.verifyTopupPayment(userId, numAmount, sessionId);
      new SuccessResponse(STATUS.OK, "Wallet top-up payment verified successfully.", result).send(res);
    } catch (error) {
      next(error);
    }
  };
}
