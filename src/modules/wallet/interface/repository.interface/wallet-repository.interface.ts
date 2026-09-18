import { ClientSession } from "mongoose";
import { PaginationMetaDto } from "@/dto/common.dto";
import { UserWallet, WalletTransaction } from "../domain/wallet.interface";
import { WalletTransactionsQueryDto } from "../../dto/wallet.dto";

export interface PaginatedTransactionsResult {
  transactions: WalletTransaction[];
  pagination: PaginationMetaDto;
  totalCredits: number;
  totalDebits: number;
}

export interface IWalletRepository {
  findWalletByUserId(userId: string, session?: ClientSession): Promise<UserWallet | null>;
  createWallet(userId: string, initialBalance?: number, session?: ClientSession): Promise<UserWallet>;
  updateBalance(userId: string, newBalance: number, session?: ClientSession): Promise<UserWallet | null>;
  createTransaction(txData: Partial<WalletTransaction>, session?: ClientSession): Promise<WalletTransaction>;
  findTransactionsByUserId(userId: string): Promise<WalletTransaction[]>;
  findTransactionByReference(reference: string): Promise<WalletTransaction | null>;
  findTransactionsPaginated(
    userId: string,
    query?: WalletTransactionsQueryDto,
  ): Promise<PaginatedTransactionsResult>;
}
