import { WalletOwnerType, WalletTransactionSource, WalletTransactionType } from "../../constants/wallet.constants";


export interface Wallet {
  id: string;

  ownerId: string;

  ownerType: WalletOwnerType;

  balance: number;

  currency: string;

  createdAt?: Date;

  updatedAt?: Date;
}


export interface WalletTransaction {
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
