import { inject, injectable } from "inversify";
import { ClientSession } from "mongoose";
import { WALLET_TYPES } from "../wallet.types";
import { UserWallet, WalletTransaction, WalletTransactionSource } from "../interface/domain/wallet.interface";
import { IWalletRepository } from "../repositories/wallet.repository";
import { WalletTransactionModel } from "../model/wallet.model";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";

import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { IPaymentService } from "@/modules/payment/interface/stripe-service.interface";

export interface CreditWalletParams {
  userId: string;
  amount: number;
  source: WalletTransactionSource;
  bookingId?: string;
  refundId?: string;
  reference?: string;
  description?: string;
}

export interface DebitWalletParams {
  userId: string;
  amount: number;
  source: WalletTransactionSource;
  bookingId?: string;
  reference?: string;
  description?: string;
}

export const MAX_WALLET_BALANCE = 10000;

export interface IWalletService {
  getOrCreateWallet(userId: string, session?: ClientSession): Promise<UserWallet>;
  creditWallet(params: CreditWalletParams, session?: ClientSession): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  debitWallet(params: DebitWalletParams, session?: ClientSession): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  topUpWallet(userId: string, amount: number): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  createTopupCheckoutSession(userId: string, amount: number): Promise<{ checkoutUrl: string; sessionId: string }>;
  verifyTopupPayment(userId: string, amount: number, sessionId: string): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  getTransactions(userId: string): Promise<WalletTransaction[]>;
}

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(WALLET_TYPES.WalletRepository)
    private _walletRepository: IWalletRepository,

    @inject(SUBSCRIPTION_TYPES.PaymentService)
    private _paymentService: IPaymentService,
  ) {}

  async getOrCreateWallet(userId: string, session?: ClientSession): Promise<UserWallet> {
    let wallet = await this._walletRepository.findWalletByUserId(userId, session);
    if (!wallet) {
      wallet = await this._walletRepository.createWallet(userId, 0, session);
    }
    return wallet;
  }

  async creditWallet(params: CreditWalletParams, session?: ClientSession): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    const { userId, amount, source, bookingId, refundId, reference, description } = params;
    if (amount <= 0) {
      throw new AppError(STATUS.BAD_REQUEST, "Credit amount must be greater than zero.");
    }

    const currentWallet = await this.getOrCreateWallet(userId, session);
    const newBalance = currentWallet.balance + amount;

    if (newBalance > MAX_WALLET_BALANCE) {
      const maxAllowed = Math.max(0, MAX_WALLET_BALANCE - currentWallet.balance);
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Wallet balance cannot exceed ₹${MAX_WALLET_BALANCE.toLocaleString()}. Maximum top-up allowed right now is ₹${maxAllowed.toLocaleString()}.`,
      );
    }

    const updatedWallet = await this._walletRepository.updateBalance(userId, newBalance, session);
    if (!updatedWallet) {
      throw new AppError(STATUS.INTERNAL_ERROR, "Failed to update wallet balance.");
    }

    const transaction = await this._walletRepository.createTransaction(
      {
        userId,
        type: "CREDIT",
        source,
        amount,
        currency: "INR",
        bookingId,
        refundId,
        reference,
        description: description || `Wallet credit via ${source}`,
      },
      session,
    );

    return { wallet: updatedWallet, transaction };
  }

  async topUpWallet(userId: string, amount: number): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    return this.creditWallet({
      userId,
      amount,
      source: "WALLET_TOPUP",
      description: `Wallet top-up (+₹${amount})`,
    });
  }

  async createTopupCheckoutSession(userId: string, amount: number): Promise<{ checkoutUrl: string; sessionId: string }> {
    if (amount <= 0) {
      throw new AppError(STATUS.BAD_REQUEST, "Top-up amount must be greater than zero.");
    }

    const currentWallet = await this.getOrCreateWallet(userId);
    if (currentWallet.balance + amount > MAX_WALLET_BALANCE) {
      const maxAllowed = Math.max(0, MAX_WALLET_BALANCE - currentWallet.balance);
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Wallet balance cannot exceed ₹${MAX_WALLET_BALANCE.toLocaleString()}. Maximum top-up allowed right now is ₹${maxAllowed.toLocaleString()}.`,
      );
    }

    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const checkoutResult = await this._paymentService.createCheckoutSession({
      planName: "Wallet Add Funds",
      description: `Bodometer Wallet Top-up (+₹${amount})`,
      amount,
      currency: "inr",
      successUrl: `${frontendBaseUrl}/wallet?topup_success=true&amount=${amount}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${frontendBaseUrl}/wallet`,
      metadata: {
        type: "WALLET_TOPUP",
        userId,
        amount: String(amount),
      },
    });

    return { checkoutUrl: checkoutResult.url, sessionId: checkoutResult.sessionId };
  }

  async verifyTopupPayment(userId: string, amount: number, sessionId: string): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    if (!sessionId) {
      throw new AppError(STATUS.BAD_REQUEST, "Payment session ID is required.");
    }

    // Check if session transaction was already processed by reference ID
    const existingTxDoc = await WalletTransactionModel.findOne({ reference: sessionId });
    if (existingTxDoc) {
      const wallet = await this.getOrCreateWallet(userId);
      const transaction: WalletTransaction = {
        id: existingTxDoc._id.toString(),
        userId: existingTxDoc.userId,
        type: existingTxDoc.type,
        source: existingTxDoc.source,
        amount: existingTxDoc.amount,
        currency: existingTxDoc.currency,
        reference: existingTxDoc.reference,
        description: existingTxDoc.description,
        createdAt: existingTxDoc.createdAt,
      };
      return { wallet, transaction };
    }

    return this.creditWallet({
      userId,
      amount,
      source: "WALLET_TOPUP",
      reference: sessionId,
      description: `Wallet top-up (+₹${amount}) via payment checkout`,
    });
  }

  async debitWallet(params: DebitWalletParams, session?: ClientSession): Promise<{ wallet: UserWallet; transaction: WalletTransaction }> {
    const { userId, amount, source, bookingId, reference, description } = params;
    if (amount <= 0) {
      throw new AppError(STATUS.BAD_REQUEST, "Debit amount must be greater than zero.");
    }

    const currentWallet = await this.getOrCreateWallet(userId, session);
    if (currentWallet.balance < amount) {
      throw new AppError(STATUS.BAD_REQUEST, "Insufficient wallet balance.");
    }

    const newBalance = currentWallet.balance - amount;
    const updatedWallet = await this._walletRepository.updateBalance(userId, newBalance, session);
    if (!updatedWallet) {
      throw new AppError(STATUS.INTERNAL_ERROR, "Failed to update wallet balance.");
    }

    const transaction = await this._walletRepository.createTransaction(
      {
        userId,
        type: "DEBIT",
        source,
        amount,
        currency: "INR",
        bookingId,
        reference,
        description: description || `Wallet debit via ${source}`,
      },
      session,
    );

    return { wallet: updatedWallet, transaction };
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    return this._walletRepository.findTransactionsByUserId(userId);
  }
}
