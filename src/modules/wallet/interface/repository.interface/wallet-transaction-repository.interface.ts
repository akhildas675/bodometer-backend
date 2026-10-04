import {
  WalletOwnerType,
} from "../../constants/wallet.constants";

import {
  WalletTransaction,
} from "../domain/wallet.interface";

import {
  WalletTransactionsQueryDto,
} from "../../dto/wallet.dto";

import { PaginationMetaDto } from "@/dto/common.dto";

export interface PaginatedWalletTransactionsResult {
  transactions: WalletTransaction[];
  pagination: PaginationMetaDto;
  totalCredits: number;
  totalDebits: number;
}

export interface IWalletTransactionRepository {

  createTransaction(
    transaction: Partial<WalletTransaction>,
  ): Promise<WalletTransaction>;

  findTransactionById(
    transactionId: string,
  ): Promise<WalletTransaction | null>;

  findTransactionByReference(
    reference: string,
  ): Promise<WalletTransaction | null>;

  findTransactionsByWalletId(
    walletId: string,
  ): Promise<WalletTransaction[]>;

  findTransactionsByOwner(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<WalletTransaction[]>;

  findTransactionsPaginated(
    ownerId: string,
    ownerType: WalletOwnerType,
    query?: WalletTransactionsQueryDto,
  ): Promise<PaginatedWalletTransactionsResult>;

  getTransactionTotals(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<{
    totalCredits: number;
    totalDebits: number;
  }>;
}