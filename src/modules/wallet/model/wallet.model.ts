import mongoose, { Document, Schema } from "mongoose";

import { Wallet } from "../interface/domain/wallet.interface";

import {
  WALLET_OWNER_TYPE,
} from "../constants/wallet.constants";


export interface IWalletDocument
  extends Omit<Wallet, "id">,
    Document {
  createdAt?: Date;
  updatedAt?: Date;
}


const WalletSchema = new Schema<IWalletDocument>(
  {
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

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);


WalletSchema.index(
  {
    ownerId: 1,
    ownerType: 1,
  },
  {
    unique: true,
  },
);


export const WalletModel =
  mongoose.model<IWalletDocument>(
    "UserWallet",
    WalletSchema,
  );