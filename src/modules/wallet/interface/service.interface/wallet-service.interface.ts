import {
  CreditWalletDto,
  DebitWalletDto,
  PaginatedWalletTransactionsResponseDto,

  WalletResponseDto,
  WalletTransactionResponseDto,
  WalletTransactionsQueryDto,
} from "../../dto/wallet.dto";



import { WalletOwnerType } from "../../constants/wallet.constants";


export interface IWalletService {

  getOrCreateWallet(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<WalletResponseDto>;


  creditWallet(
    params: CreditWalletDto,
  ): Promise<{
    wallet: WalletResponseDto;
    transaction: WalletTransactionResponseDto;
  }>;


  debitWallet(
    params: DebitWalletDto,
  ): Promise<{
    wallet: WalletResponseDto;
    transaction: WalletTransactionResponseDto;
  }>;





  topUpWallet(
    userId: string,
    amount: number,
  ): Promise<{
    wallet: WalletResponseDto;
    transaction: WalletTransactionResponseDto;
  }>;


  createTopupCheckoutSession(
    userId: string,
    amount: number,
  ): Promise<{
    checkoutUrl: string;
    sessionId: string;
  }>;


  verifyTopupPayment(
    userId: string,
    amount: number,
    sessionId: string,
  ): Promise<{
    wallet: WalletResponseDto;
    transaction: WalletTransactionResponseDto;
  }>;


  getTransactions(
    ownerId: string,
    ownerType: WalletOwnerType,
  ): Promise<WalletTransactionResponseDto[]>;


  getTransactionsPaginated(
    ownerId: string,
    ownerType: WalletOwnerType,
    query?: WalletTransactionsQueryDto,
  ): Promise<PaginatedWalletTransactionsResponseDto>;

}