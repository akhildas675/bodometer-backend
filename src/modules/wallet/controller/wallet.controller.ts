import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";

import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { AppError } from "@/utils/appError";

import { WALLET_TYPES } from "../wallet.types";

import { IWalletService } from "../interface/service.interface/wallet-service.interface";

import {
  WALLET_OWNER_TYPE,
} from "../constants/wallet.constants";

import {
  AddFundsDto,
  CreateTopupCheckoutDto,
  VerifyTopupPaymentDto,
  WalletTransactionsQueryDto,
} from "../dto/wallet.dto";


@injectable()
export class WalletController {

  constructor(
    @inject(WALLET_TYPES.WalletService)
    private _walletService: IWalletService,
  ) {}


  getWallet = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          "User authentication required.",
        );
      }

      const wallet =
        await this._walletService.getOrCreateWallet(
          userId,
          WALLET_OWNER_TYPE.USER,
        );

      new SuccessResponse(
        STATUS.OK,
        "Wallet balance retrieved successfully.",
        wallet,
      ).send(res);

    } catch (error) {
      next(error);
    }
  };


  getTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          "User authentication required.",
        );
      }

      const query =
        req.query as WalletTransactionsQueryDto;

      const result =
        await this._walletService.getTransactionsPaginated(
          userId,
          WALLET_OWNER_TYPE.USER,
          query,
        );

      new SuccessResponse(
        STATUS.OK,
        "Wallet transactions retrieved successfully.",
        result,
      ).send(res);

    } catch (error) {
      next(error);
    }
  };


  addFunds = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          "User authentication required.",
        );
      }

      const { amount } =
        req.body as AddFundsDto;

      const result =
        await this._walletService.topUpWallet(
          userId,
          amount,
        );

      new SuccessResponse(
        STATUS.OK,
        "Wallet funds added successfully.",
        result,
      ).send(res);

    } catch (error) {
      next(error);
    }
  };


  createTopupCheckout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          "User authentication required.",
        );
      }

      const { amount } =
        req.body as CreateTopupCheckoutDto;

      const result =
        await this._walletService.createTopupCheckoutSession(
          userId,
          amount,
        );

      new SuccessResponse(
        STATUS.OK,
        "Top-up payment checkout session created.",
        result,
      ).send(res);

    } catch (error) {
      next(error);
    }
  };


  verifyTopupPayment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          "User authentication required.",
        );
      }

      const {
        amount,
        sessionId,
      } = req.body as VerifyTopupPaymentDto;

      const result =
        await this._walletService.verifyTopupPayment(
          userId,
          amount,
          sessionId,
        );

      new SuccessResponse(
        STATUS.OK,
        "Wallet top-up payment verified successfully.",
        result,
      ).send(res);

    } catch (error) {
      next(error);
    }
  };
}