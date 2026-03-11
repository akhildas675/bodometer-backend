import { PLAN_TYPES, PlanType } from "@/constants/subscription";
import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionDocument extends Document {
    subscriptionName: string;
    description: string;
    price: number;
    durationDays: number;
    features: string[];
    liveSessionCount: number;
    planType:PlanType,
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
    {
        subscriptionName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        durationDays: {
            type: Number,
            required: true,
            min: 1,
        },

        features: {
            type: [String],
            required: true,
            default: [],
        },

        liveSessionCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        planType: {
            type: String,
            enum: Object.values(PLAN_TYPES),
            required: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

SubscriptionSchema.index({ subscriptionName: 1 });

export const SubscriptionModel = mongoose.model<ISubscriptionDocument>(
    "Subscription",
    SubscriptionSchema
);