import {
  Wallet,
  WalletTransaction,
} from "../interface/domain/wallet.interface";

import {
  WalletResponseDto,
  WalletTransactionResponseDto,
  PaginatedWalletTransactionsResponseDto,
} from "../dto/wallet.dto";

import { PaginationMetaDto } from "@/dto/common.dto";

export class WalletMapper {

  static toWalletResponseDto(
    wallet: Wallet,
  ): WalletResponseDto {
    return {
      id: wallet.id,
      ownerId: wallet.ownerId,
      ownerType: wallet.ownerType,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  static toTransactionResponseDto(
    transaction: WalletTransaction,
  ): WalletTransactionResponseDto {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      ownerId: transaction.ownerId,
      ownerType: transaction.ownerType,
      type: transaction.type,
      source: transaction.source,
      amount: transaction.amount,
      currency: transaction.currency,
      bookingId: transaction.bookingId,
      refundId: transaction.refundId,
      payoutRequestId: transaction.payoutRequestId,
      reference: transaction.reference,
      description: transaction.description,
      createdAt: transaction.createdAt,
    };
  }

  static toPaginatedTransactionsResponseDto(
    transactions: WalletTransaction[],
    pagination: PaginationMetaDto,
    totalCredits: number,
    totalDebits: number,
  ): PaginatedWalletTransactionsResponseDto {
    return {
      transactions: transactions.map(
        (transaction) =>
          this.toTransactionResponseDto(transaction),
      ),
      pagination,
      totalCredits,
      totalDebits,
    };
  }
}