import { LIMIT_TYPES, LimitType } from "@/constants/subscription.constant";
import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;

  description?: string;

  price: number;

  durationInDays: number;

  features: {
    featureId: mongoose.Types.ObjectId;

    limit?: number;

    limitType?: LimitType;
  }[];

  isPopular: boolean;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    durationInDays: {
      type: Number,
      required: true,
      min: 1,
    },

    features: [
      {
        featureId: {
          type: Schema.Types.ObjectId,
          ref: "SubscriptionFeature",
          required: true,
        },

        limit: {
          type: Number,
        },

        limitType: {
          type: String,
          enum: LIMIT_TYPES,
        },
      },
    ],

    isPopular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  SubscriptionPlanSchema,
);
