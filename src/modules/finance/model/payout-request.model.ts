import mongoose, { Document, Schema } from "mongoose";
import { PayoutRequest, CreatePayoutRequestInput } from "../interface/payout-request.interface";
import { PAYOUT_STATUS } from "../constant/finance.constant";



export interface IPayoutRequestDocument
  extends Omit<PayoutRequest, "id">,
    Document {
  createdAt?: Date;
  updatedAt?: Date;
}

const PayoutRequestSchema = new Schema<IPayoutRequestDocument>(
  {
    trainerId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    reservedAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      required: true,
      default: "INR",
    },

    status: {
      type: String,
      enum: Object.values(PAYOUT_STATUS),
      required: true,
      default: PAYOUT_STATUS.PENDING,
      index: true,
    },

    payoutMethod: {
      type: String,
      default: "MANUAL_BANK_TRANSFER",
    },

    bankTransferReference: {
      type: String,
      default: undefined,
      index: true,
    },

    transferredAt: {
      type: Date,
      default: undefined,
    },

    processedBy: {
      type: String,
      ref: "User",
      default: undefined,
    },

    adminNote: {
      type: String,
      default: undefined,
    },

    bankDetails: {
      accountHolderName: { type: String, default: undefined },
      accountNumber: { type: String, default: undefined },
      ifscCode: { type: String, default: undefined },
      bankName: { type: String, default: undefined },
      upiId: { type: String, default: undefined },
    },

    providerPayoutId: {
      type: String,
      default: undefined,
    },

    rejectionReason: {
      type: String,
      default: undefined,
    },

    failureReason: {
      type: String,
      default: undefined,
    },

    requestedAt: {
      type: Date,
      required: true,
    },
    approvedAt: {
      type: Date,
      default: undefined,
    },
    processedAt: {
      type: Date,
      default: undefined,
    },
    completedAt: {
      type: Date,
      default: undefined,
    },
    rejectedAt: {
      type: Date,
      default: undefined,
    },
    failedAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

PayoutRequestSchema.index({ trainerId: 1, status: 1 });
PayoutRequestSchema.index({ status: 1, requestedAt: -1 });

export const PayoutRequestModel = mongoose.model<IPayoutRequestDocument>(
  "PayoutRequest",
  PayoutRequestSchema,
);


export type { CreatePayoutRequestInput };
