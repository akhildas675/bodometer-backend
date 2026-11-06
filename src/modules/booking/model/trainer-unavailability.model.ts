import mongoose, { Document, Schema } from "mongoose";

export type UnavailabilityType =
  | "VACATION"
  | "MEDICAL_LEAVE"
  | "EMERGENCY"
  | "PERSONAL_LEAVE";

export interface ITrainerUnavailability extends Document {
  trainerId: mongoose.Types.ObjectId;
  type: UnavailabilityType;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt?: Date;
  updatedAt?: Date;
}

const TrainerUnavailabilitySchema = new Schema<ITrainerUnavailability>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["VACATION", "MEDICAL_LEAVE", "EMERGENCY", "PERSONAL_LEAVE"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["ACTIVE", "CANCELLED"], default: "ACTIVE" },
  },
  { timestamps: true },
);

// Compound indexes for critical query patterns
TrainerUnavailabilitySchema.index({ trainerId: 1, status: 1 });
TrainerUnavailabilitySchema.index({ trainerId: 1, startDate: 1, endDate: 1, status: 1 });

export const TrainerUnavailabilityModel =
  mongoose.model<ITrainerUnavailability>(
    "TrainerUnavailability",
    TrainerUnavailabilitySchema,
  );
