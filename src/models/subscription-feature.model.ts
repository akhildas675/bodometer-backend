import { FEATURE_TYPES, FeatureType } from "@/constants/subscription.constant";
import mongoose, { Document, Schema } from "mongoose";

export interface ISubscriptionFeature extends Document {
  featureId: string;
  key: string;
  title: string;
  description: string;
  type: FeatureType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionFeatureSchema = new Schema<ISubscriptionFeature>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    type: {
      type: String,
      enum: FEATURE_TYPES,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const SubscriptionFeatureModel = mongoose.model<ISubscriptionFeature>(
  "SubscriptionFeature",
  SubscriptionFeatureSchema,
);
