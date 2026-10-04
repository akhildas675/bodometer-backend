import mongoose, {
  Document,
  Schema,
} from "mongoose";

import {
  WalletTransaction,
} from "../interface/domain/wallet.interface";

import {
  WALLET_OWNER_TYPE,
  WALLET_TRANSACTION_SOURCE,
  WALLET_TRANSACTION_TYPE,
} from "../constants/wallet.constants";


export interface IWalletTransactionDocument
  extends Omit<WalletTransaction, "id">,
    Document {
  createdAt?: Date;
}


const WalletTransactionSchema =
  new Schema<IWalletTransactionDocument>(
    {
      walletId: {
        type: String,
        required: true,
        index: true,
        ref: "UserWallet",
      },

      ownerId: {
        type: String,
        required: true,
        index: true,
      },

      ownerType: {
        type: String,
        enum: Object.values(WALLET_OWNER_TYPE),
        required: true,
        index: true,
      },

      type: {
        type: String,
        enum: Object.values(
          WALLET_TRANSACTION_TYPE,
        ),
        required: true,
      },

      source: {
        type: String,
        enum: Object.values(
          WALLET_TRANSACTION_SOURCE,
        ),
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        required: true,
        default: "INR",
      },

      bookingId: {
        type: String,
        ref: "Booking",
      },

      refundId: {
        type: String,
        ref: "BookingRefund",
      },

      payoutRequestId: {
        type: String,
        ref: "PayoutRequest",
      },

      reference: {
        type: String,
        index: true,
      },

      description: {
        type: String,
      },
    },
    {
      timestamps: {
        createdAt: true,
        updatedAt: false,
      },
    },
  );


WalletTransactionSchema.index({
  walletId: 1,
  createdAt: -1,
});


WalletTransactionSchema.index({
  ownerId: 1,
  ownerType: 1,
  createdAt: -1,
});


export const WalletTransactionModel =
  mongoose.model<IWalletTransactionDocument>(
    "WalletTransaction",
    WalletTransactionSchema,
  );