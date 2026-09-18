import { PaginationMetaDto } from "@/dto/common.dto";
import {
  WalletTransactionSource,
  WalletTransactionType,
} from "../interface/domain/wallet.interface";

export interface UserWalletResponseDto {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WalletTransactionResponseDto {
  id: string;
  userId: string;
  type: WalletTransactionType;
  source: WalletTransactionSource;
  amount: number;
  currency: string;
  bookingId?: string;
  refundId?: string;
  reference?: string;
  description?: string;
  createdAt?: Date;
}

export interface WalletTransactionsQueryDto {
  page?: number;
  limit?: number;
  type?: WalletTransactionType | "ALL";
  search?: string;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedWalletTransactionsResponseDto {
  transactions: WalletTransactionResponseDto[];
  pagination: PaginationMetaDto;
  totalCredits: number;
  totalDebits: number;
}

export interface AddFundsDto {
  amount: number;
}

export interface CreateTopupCheckoutDto {
  amount: number;
}

export interface VerifyTopupPaymentDto {
  amount: number;
  sessionId: string;
}
