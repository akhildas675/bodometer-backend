import { Schema, model, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  purpose: string;
  otp: string;
  attempts: number;
  isVerified: boolean;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, index: true },
    purpose: { type: String, required: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 300 },
  },
  {
    timestamps: false,
  },
);

otpSchema.index({ email: 1, purpose: 1 });

export const OtpModel = model<IOtp>("Otp", otpSchema);
