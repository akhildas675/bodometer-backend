import { PaginationMetaDto } from "@/dto/common.dto";
import { UserWallet, WalletTransaction } from "../interface/domain/wallet.interface";
import {
  PaginatedWalletTransactionsResponseDto,
  UserWalletResponseDto,
  WalletTransactionResponseDto,
} from "../dto/wallet.dto";

export class WalletMapper {
  static toWalletResponseDto(wallet: UserWallet): UserWalletResponseDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      currency: wallet.currency,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  static toTransactionResponseDto(tx: WalletTransaction): WalletTransactionResponseDto {
    return {
      id: tx.id,
      userId: tx.userId,
      type: tx.type,
      source: tx.source,
      amount: tx.amount,
      currency: tx.currency,
      bookingId: tx.bookingId,
      refundId: tx.refundId,
      reference: tx.reference,
      description: tx.description,
      createdAt: tx.createdAt,
    };
  }

  static toTransactionResponseDtoList(
    transactions: WalletTransaction[],
  ): WalletTransactionResponseDto[] {
    return transactions.map((tx) => this.toTransactionResponseDto(tx));
  }

  static toPaginatedTransactionsResponseDto(
    transactions: WalletTransaction[],
    pagination: PaginationMetaDto,
    totalCredits: number,
    totalDebits: number,
  ): PaginatedWalletTransactionsResponseDto {
    return {
      transactions: this.toTransactionResponseDtoList(transactions),
      pagination,
      totalCredits,
      totalDebits,
    };
  }
}
