import mongoose, { Document, Schema } from "mongoose";
import { UserWallet, WalletTransaction } from "../interface/domain/wallet.interface";

export interface IUserWalletDocument extends Omit<UserWallet, "id">, Document {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWalletTransactionDocument extends Omit<WalletTransaction, "id">, Document {
  createdAt?: Date;
  updatedAt?: Date;
}

const UserWalletSchema = new Schema<IUserWalletDocument>(
  {
    userId: { type: String, required: true, unique: true, index: true, ref: "User" },
    balance: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true },
);

const WalletTransactionSchema = new Schema<IWalletTransactionDocument>(
  {
    userId: { type: String, required: true, index: true, ref: "User" },
    type: { type: String, enum: ["CREDIT", "DEBIT"], required: true },
    source: { type: String, enum: ["BOOKING_REFUND", "BOOKING_PAYMENT", "MANUAL_ADJUSTMENT", "WALLET_TOPUP"], required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    bookingId: { type: String, ref: "Booking" },
    refundId: { type: String, ref: "BookingRefund" },
    reference: { type: String, index: true },
    description: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const UserWalletModel = mongoose.model<IUserWalletDocument>("UserWallet", UserWalletSchema);
export const WalletTransactionModel = mongoose.model<IWalletTransactionDocument>("WalletTransaction", WalletTransactionSchema);
