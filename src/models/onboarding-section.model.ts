import mongoose, { Schema, Document } from "mongoose";

export interface IOnboardingSection extends Document {
  id: any;
  key:      string;  // "medical" | "workout" | "daily_habits" | "fitness"
  title:    string;  // admin can edit display title
  order:    number;  // admin can reorder sections
  isActive: boolean;
}

const OnboardingSectionSchema = new Schema<IOnboardingSection>(
  {
    key:      { type: String, required: true, unique: true },
    title:    { type: String, required: true },
    order:    { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const OnboardingSectionModel = mongoose.model(
  "OnboardingSection",
  OnboardingSectionSchema
);