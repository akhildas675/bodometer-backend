import {
  SUBSCRIPTION_STATUSES,
  SubscriptionStatus,
} from "@/constants/subscription.constant";
import mongoose, { Document, Schema } from "mongoose";

export interface IUserSubscription extends Document {
  userId: mongoose.Types.ObjectId;

  subscriptionPlanId: mongoose.Types.ObjectId;

  startDate: Date;

  endDate: Date;

  status: SubscriptionStatus;

  autoRenew: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema = new Schema<IUserSubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: "active",
      index: true,
    },

    autoRenew: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const UserSubscriptionModel = mongoose.model<IUserSubscription>(
  "UserSubscription",
  UserSubscriptionSchema,
);
