import mongoose, { Document, Schema } from "mongoose";

export type OtpPurpose =
  | "USER_REGISTER"
  | "TRAINER_REGISTER"
  | "FORGET_PASSWORD";

export interface IOtp extends Document {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  attempts: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["USER_REGISTER", "TRAINER_REGISTER", "FORGET_PASSWORD"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// TTL index
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent multiple active OTPs
OtpSchema.index({ email: 1, purpose: 1 }, { unique: true });

export const OtpModel = mongoose.model<IOtp>("Otp", OtpSchema);
