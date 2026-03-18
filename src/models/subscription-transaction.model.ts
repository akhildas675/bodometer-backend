import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface ISubscriptionTransactionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  gatewayOrderId: string;
  gatewayPaymentId?: string | null;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  isRenewal: boolean;
  purchasedAt?: Date | null;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionTransactionSchema = new Schema<ISubscriptionTransactionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "Subscription", required: true },
    gatewayOrderId: { type: String, required: true },
    gatewayPaymentId: { type: String, default: null },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "inr" },
    paymentMethod: { type: String, default: "stripe" },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    isRenewal: { type: Boolean, default: false },
    purchasedAt: { type: Date, default: null },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  { timestamps: true }
);

export const SubscriptionTransactionModel = mongoose.model<ISubscriptionTransactionDocument>(
  "SubscriptionTransaction",
  SubscriptionTransactionSchema
);