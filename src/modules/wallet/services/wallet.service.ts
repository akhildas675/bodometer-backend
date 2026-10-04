import { inject, injectable } from "inversify";

import { WALLET_TYPES } from "../wallet.types";

import {
  Wallet,
  WalletTransaction,
} from "../interface/domain/wallet.interface";

import {
  CreditWalletDto,
  DebitWalletDto,
  PaginatedWalletTransactionsResponseDto,
  WalletTransactionsQueryDto,
} from "../dto/wallet.dto";

import { IWalletRepository } from "../interface/repository.interface/wallet-repository.interface";

import { IWalletTransactionRepository } from "../interface/repository.interface/wallet-transaction-repository.interface";

import { IWalletService } from "../interface/service.interface/wallet-service.interface";

import {
  MAX_WALLET_BALANCE,
  WALLET_OWNER_TYPE,
  WALLET_TRANSACTION_SOURCE,
  WALLET_TRANSACTION_TYPE,
  WalletOwnerType,
} from "../constants/wallet.constants";

import { WalletMapper } from "../mapper/wallet.mapper";

import { AppError } from "@/utils/appError";

import { STATUS } from "@/constants/constant.values.ts/statuscode";

import { SUBSCRIPTION_TYPES } from "@/modules/subscription/subscription.types";
import { IPaymentService } from "@/modules/payment/interface/stripe-service.interface";

import { USER_TYPES } from "@/modules/user/user.types";
import { IUserRepository } from "@/modules/user/interface/user-repository.interface";

import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";

import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_TYPE,
} from "@/modules/notification/constant/notification.constant";

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(WALLET_TYPES.WalletRepository)
    private _walletRepository: IWalletRepository,

    @inject(WALLET_TYPES.WalletTransactionRepository)
    private _walletTransactionRepository: IWalletTransactionRepository,

    @inject(SUBSCRIPTION_TYPES.PaymentService)
    private _paymentService: IPaymentService,

    @inject(NOTIFICATION_TYPES.NotificationService)
    private _notificationService: INotificationService,

    @inject(USER_TYPES.UserRepository)
    private _userRepository: IUserRepository,
  ) {}

  async getOrCreateWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<Wallet> {
    let wallet = await this._walletRepository.findWallet(ownerId, ownerType);

    if (!wallet) {
      wallet = await this._walletRepository.createWallet(ownerId, ownerType, 0);
    }

    return wallet;
  }

  async creditWallet(params: CreditWalletDto): Promise<{
    wallet: Wallet;
    transaction: WalletTransaction;
  }> {
    const {
      ownerId,
      ownerType,
      amount,
      source,
      bookingId,
      refundId,
      payoutRequestId,
      reference,
      description,
    } = params;

    if (amount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Credit amount must be greater than zero.",
      );
    }

    await this.getOrCreateWallet(ownerId, ownerType);

    const updatedWallet = await this._walletRepository.incrementBalance(
      ownerId,
      ownerType,
      amount,
    );

    if (!updatedWallet) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        "Failed to update wallet balance.",
      );
    }

    const transaction =
      await this._walletTransactionRepository.createTransaction({
        walletId: updatedWallet.id,

        ownerId,
        ownerType,

        type: WALLET_TRANSACTION_TYPE.CREDIT,

        source,

        amount,

        currency: updatedWallet.currency,

        bookingId,

        refundId,

        payoutRequestId,

        reference,

        description: description || `Wallet credit via ${source}`,
      });

    if (ownerType === WALLET_OWNER_TYPE.USER) {
      const userDoc = await this._userRepository.findById(ownerId);

      this._notificationService
        .createNotification({
          recipientId: ownerId,

          type: NOTIFICATION_TYPE.WALLET_CREDITED,

          entityType: NOTIFICATION_ENTITY_TYPE.WALLET,

          entityId: transaction.id,

          variables: {
            userName: userDoc?.name || "User",

            amount,

            currency: updatedWallet.currency,
          },
        })
        .catch((err) => console.error("Notification error:", err));
    }

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  async debitWallet(params: DebitWalletDto): Promise<{
    wallet: Wallet;
    transaction: WalletTransaction;
  }> {
    const {
      ownerId,
      ownerType,
      amount,
      source,
      bookingId,
      payoutRequestId,
      reference,
      description,
    } = params;

    if (amount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Debit amount must be greater than zero.",
      );
    }

    const wallet = await this.getOrCreateWallet(ownerId, ownerType);

    if (wallet.balance < amount) {
      throw new AppError(STATUS.BAD_REQUEST, "Insufficient wallet balance.");
    }

    const updatedWallet = await this._walletRepository.decrementBalance(
      ownerId,
      ownerType,
      amount,
    );

    if (!updatedWallet) {
      throw new AppError(
        STATUS.INTERNAL_ERROR,
        "Failed to update wallet balance.",
      );
    }

    const transaction =
      await this._walletTransactionRepository.createTransaction({
        walletId: updatedWallet.id,

        ownerId,
        ownerType,

        type: WALLET_TRANSACTION_TYPE.DEBIT,

        source,

        amount,

        currency: updatedWallet.currency,

        bookingId,

        payoutRequestId,

        reference,

        description: description || `Wallet debit via ${source}`,
      });

    if (ownerType === WALLET_OWNER_TYPE.USER) {
      const userDoc = await this._userRepository.findById(ownerId);

      this._notificationService
        .createNotification({
          recipientId: ownerId,

          type: NOTIFICATION_TYPE.WALLET_PAYMENT_SUCCESSFUL,

          entityType: NOTIFICATION_ENTITY_TYPE.WALLET,

          entityId: transaction.id,

          variables: {
            userName: userDoc?.name || "User",

            amount,

            currency: updatedWallet.currency,

            purpose: description || "Coaching Service",
          },
        })
        .catch((err) => console.error("Notification error:", err));
    }

    return {
      wallet: updatedWallet,
      transaction,
    };
  }

  async topUpWallet(
    userId: string,
    amount: number,
  ): Promise<{
    wallet: Wallet;
    transaction: WalletTransaction;
  }> {
    if (amount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Top-up amount must be greater than zero.",
      );
    }

    const currentWallet = await this.getOrCreateWallet(
      userId,
      WALLET_OWNER_TYPE.USER,
    );

    if (currentWallet.balance + amount > MAX_WALLET_BALANCE) {
      const maxAllowed = Math.max(
        0,
        MAX_WALLET_BALANCE - currentWallet.balance,
      );

      throw new AppError(
        STATUS.BAD_REQUEST,

        `Wallet balance cannot exceed ₹${MAX_WALLET_BALANCE.toLocaleString()}. Maximum top-up allowed right now is ₹${maxAllowed.toLocaleString()}.`,
      );
    }

    return this.creditWallet({
      ownerId: userId,

      ownerType: WALLET_OWNER_TYPE.USER,

      amount,

      source: WALLET_TRANSACTION_SOURCE.WALLET_TOPUP,

      description: `Wallet top-up (+₹${amount})`,
    });
  }

  async createTopupCheckoutSession(
    userId: string,
    amount: number,
  ): Promise<{
    checkoutUrl: string;
    sessionId: string;
  }> {
    if (amount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Top-up amount must be greater than zero.",
      );
    }

    const currentWallet = await this.getOrCreateWallet(
      userId,
      WALLET_OWNER_TYPE.USER,
    );

    if (currentWallet.balance + amount > MAX_WALLET_BALANCE) {
      const maxAllowed = Math.max(
        0,
        MAX_WALLET_BALANCE - currentWallet.balance,
      );

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

    return {
      checkoutUrl: checkoutResult.url,

      sessionId: checkoutResult.sessionId,
    };
  }

  async verifyTopupPayment(
    userId: string,
    amount: number,
    sessionId: string,
  ): Promise<{
    wallet: Wallet;
    transaction: WalletTransaction;
  }> {
    if (!sessionId) {
      throw new AppError(STATUS.BAD_REQUEST, "Payment session ID is required.");
    }

    const existingTx =
      await this._walletTransactionRepository.findTransactionByReference(
        sessionId,
      );

    if (existingTx) {
      const wallet = await this.getOrCreateWallet(
        userId,
        WALLET_OWNER_TYPE.USER,
      );

      return {
        wallet,
        transaction: existingTx,
      };
    }

    return this.creditWallet({
      ownerId: userId,

      ownerType: WALLET_OWNER_TYPE.USER,

      amount,

      source: WALLET_TRANSACTION_SOURCE.WALLET_TOPUP,

      reference: sessionId,

      description: `Wallet top-up (+₹${amount}) via payment checkout`,
    });
  }

  async getTransactions(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<WalletTransaction[]> {
    return this._walletTransactionRepository.findTransactionsByOwner(
      ownerId,
      ownerType,
    );
  }

  async getTransactionsPaginated(
    ownerId: string,
    ownerType: WalletOwnerType,
    query?: WalletTransactionsQueryDto,
  ): Promise<PaginatedWalletTransactionsResponseDto> {
    const result =
      await this._walletTransactionRepository.findTransactionsPaginated(
        ownerId,
        ownerType,
        query,
      );

    return WalletMapper.toPaginatedTransactionsResponseDto(
      result.transactions,

      result.pagination,

      result.totalCredits,

      result.totalDebits,
    );
  }
}
