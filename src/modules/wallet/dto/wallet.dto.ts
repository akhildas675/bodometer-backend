import { PaginationMetaDto } from "@/dto/common.dto";

import {
  WalletOwnerType,
  WalletTransactionSource,
  WalletTransactionType,
} from "../constants/wallet.constants";


export interface WalletResponseDto {
  id: string;

  ownerId: string;

  ownerType: WalletOwnerType;

  balance: number;

  currency: string;

  createdAt?: Date;

  updatedAt?: Date;
}


export interface WalletTransactionResponseDto {
  id: string;

  walletId: string;

  ownerId: string;

  ownerType: WalletOwnerType;

  type: WalletTransactionType;

  source: WalletTransactionSource;

  amount: number;

  currency: string;

  bookingId?: string;

  refundId?: string;

  payoutRequestId?: string;

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




export interface CreditWalletDto {
  ownerId: string;

  ownerType: WalletOwnerType;

  amount: number;

  source: WalletTransactionSource;

  bookingId?: string;

  refundId?: string;

  payoutRequestId?: string;

  reference?: string;

  description?: string;
}


export interface DebitWalletDto {
  ownerId: string;

  ownerType: WalletOwnerType;

  amount: number;

  source: WalletTransactionSource;

  bookingId?: string;

  payoutRequestId?: string;

  reference?: string;

  description?: string;
}


export interface TransferWalletDto {
  fromOwnerId: string;

  fromOwnerType: WalletOwnerType;

  toOwnerId: string;

  toOwnerType: WalletOwnerType;

  amount: number;

  source: WalletTransactionSource;

  bookingId?: string;

  refundId?: string;

  payoutRequestId?: string;

  reference?: string;

  description?: string;
}