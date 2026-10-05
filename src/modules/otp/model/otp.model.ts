import { OtpPurpose } from "@/constants/constant.values.ts/otp.constants";
import { Schema, model, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  purpose: OtpPurpose;

  otp: string;
  otpExpiresAt: Date;

  attempts: number;
  isVerified: boolean;

  resendCount: number;
  resendWindowStartedAt: Date;
  resendWindowExpiresAt: Date;

  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    purpose: {
      type: String,
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    otpExpiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    resendCount: {
      type: Number,
      default: 0,
    },

    resendWindowStartedAt: {
      type: Date,
      required: true,
    },

    resendWindowExpiresAt: {
      type: Date,
      required: true,
      index: true,
      expires: 0,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

otpSchema.index(
  { email: 1, purpose: 1 },
  { unique: true },
);

export const OtpModel = model<IOtp>("Otp", otpSchema);