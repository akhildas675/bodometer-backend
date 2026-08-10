export type WalletTransactionType = "CREDIT" | "DEBIT";
export type WalletTransactionSource = "BOOKING_REFUND" | "BOOKING_PAYMENT" | "MANUAL_ADJUSTMENT" | "WALLET_TOPUP";

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WalletTransaction {
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
