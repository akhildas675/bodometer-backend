import mongoose, { Document, Schema } from "mongoose";
import {
  FinancialTransaction,
  CreateFinancialTransactionInput,
} from "../interface/financial-transaction.interface";
import {
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../constant/finance.constant";


export interface IFinancialTransactionDocument
  extends Omit<FinancialTransaction, "id">,
    Document {
  createdAt?: Date;
  updatedAt?: Date;
}


const FinancialTransactionSchema = new Schema<IFinancialTransactionDocument>(
  {
    bookingId: {
      type: String,
      ref: "Booking",
      index: true,
      default: undefined,
    },
    paymentId: {
      type: String,
      default: undefined,
    },
    userId: {
      type: String,
      ref: "User",
      index: true,
      default: undefined,
    },
    trainerId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },

    grossAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    trainerAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    trainerPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    platformPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    transactionType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(TRANSACTION_STATUS),
      required: true,
      default: TRANSACTION_STATUS.COMPLETED,
      index: true,
    },

    referenceKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    relatedTransactionId: {
      type: String,
      ref: "FinancialTransaction",
      default: undefined,
    },

    note: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,

  },
);



FinancialTransactionSchema.index({ trainerId: 1, createdAt: -1 });


FinancialTransactionSchema.index({ transactionType: 1, status: 1, createdAt: -1 });


FinancialTransactionSchema.index({ trainerId: 1, transactionType: 1, status: 1 });


export const FinancialTransactionModel = mongoose.model<IFinancialTransactionDocument>(
  "FinancialTransaction",
  FinancialTransactionSchema,
);

export type { CreateFinancialTransactionInput };
