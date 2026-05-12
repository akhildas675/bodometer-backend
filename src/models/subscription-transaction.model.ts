import { PAYMENT_GATEWAYS, PaymentGateway, TRANSACTION_STATUSES, TransactionStatus } from "@/constants/subscription.constant";
import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionTransaction
  extends Document {

  userId: mongoose.Types.ObjectId;

  subscriptionPlanId: mongoose.Types.ObjectId;

  userSubscriptionId?: mongoose.Types.ObjectId;

  amount: number;

  currency: string;

  paymentMethod: string;

  paymentGateway: PaymentGateway;

  transactionId?: string;

  paymentStatus: TransactionStatus;

  paidAt?: Date;

  meta?: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionTransactionSchema =
  new Schema<ISubscriptionTransaction>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      subscriptionPlanId: {
        type: Schema.Types.ObjectId,
        ref: "SubscriptionPlan",
        required: true
      },

      userSubscriptionId: {
        type: Schema.Types.ObjectId,
        ref: "UserSubscription"
      },

      amount: {
        type: Number,
        required: true,
        min: 0
      },

      currency: {
        type: String,
        default: "INR"
      },

      paymentMethod: {
        type: String,
        required: true
      },

      paymentGateway: {
        type: String,
        enum: PAYMENT_GATEWAYS,
        required: true
      },

      transactionId: {
        type: String
      },

      paymentStatus: {
        type: String,
        enum: TRANSACTION_STATUSES,
        default: "pending",
        index: true
      },

      paidAt: {
        type: Date
      },

      meta: {
        type: Schema.Types.Mixed
      }
    },
    { timestamps: true }
  );

export const SubscriptionTransactionModel =
  mongoose.model<ISubscriptionTransaction>(
    "SubscriptionTransaction",
    SubscriptionTransactionSchema
  );