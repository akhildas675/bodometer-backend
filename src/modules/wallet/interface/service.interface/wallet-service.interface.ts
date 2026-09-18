import { ClientSession } from "mongoose";
import {
  UserWallet,
  WalletTransaction,
  WalletTransactionSource,
} from "../domain/wallet.interface";
import {
  PaginatedWalletTransactionsResponseDto,
  WalletTransactionsQueryDto,
} from "../../dto/wallet.dto";

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

export interface IWalletService {
  getOrCreateWallet(userId: string, session?: ClientSession): Promise<UserWallet>;
  creditWallet(
    params: CreditWalletParams,
    session?: ClientSession,
  ): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  debitWallet(
    params: DebitWalletParams,
    session?: ClientSession,
  ): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  topUpWallet(
    userId: string,
    amount: number,
  ): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  createTopupCheckoutSession(
    userId: string,
    amount: number,
  ): Promise<{ checkoutUrl: string; sessionId: string }>;
  verifyTopupPayment(
    userId: string,
    amount: number,
    sessionId: string,
  ): Promise<{ wallet: UserWallet; transaction: WalletTransaction }>;
  getTransactions(userId: string): Promise<WalletTransaction[]>;
  getTransactionsPaginated(
    userId: string,
    query?: WalletTransactionsQueryDto,
  ): Promise<PaginatedWalletTransactionsResponseDto>;
}
