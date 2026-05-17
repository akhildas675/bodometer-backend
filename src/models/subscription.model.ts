import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: string;

  description?: string;

  price: number;

  durationInDays: number;

  features: {
    featureId: mongoose.Types.ObjectId;

    enabled: boolean;

    limit?: number;
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
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    durationInDays: {
      type: Number,
      required: true,
    },

    features: [
      {
        featureId: {
          type: Schema.Types.ObjectId,
          ref: "Feature",
          required: true,
        },

        enabled: {
          type: Boolean,
          default: true,
        },

        limit: Number,
      },
    ],

    isPopular: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const SubscriptionPlanModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  SubscriptionPlanSchema,
);
