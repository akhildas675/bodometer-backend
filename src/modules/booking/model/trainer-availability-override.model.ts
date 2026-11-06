import mongoose, { Document, Schema } from "mongoose";

export interface IShiftMinutes {
  startMinute: number;
  endMinute: number;
}

export interface ITrainerAvailabilityOverride extends Document {
  trainerId: mongoose.Types.ObjectId;
  availabilityId?: mongoose.Types.ObjectId;
  date: Date;
  shifts: IShiftMinutes[];
  reason?: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt?: Date;
  updatedAt?: Date;
}

const ShiftMinutesSchema = new Schema<IShiftMinutes>(
  {
    startMinute: { type: Number, required: true },
    endMinute: { type: Number, required: true },
  },
  { _id: false },
);

const TrainerAvailabilityOverrideSchema =
  new Schema<ITrainerAvailabilityOverride>(
    {
      trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      availabilityId: {
        type: Schema.Types.ObjectId,
        ref: "TrainerAvailability",
        required: false,
      },
      date: { type: Date, required: true },
      shifts: { type: [ShiftMinutesSchema], required: true },
      reason: { type: String, default: "" },
      status: {
        type: String,
        enum: ["ACTIVE", "CANCELLED"],
        default: "ACTIVE",
      },
    },
    { timestamps: true },
  );

// Compound indexes for critical query patterns
TrainerAvailabilityOverrideSchema.index({ trainerId: 1, date: 1, status: 1 });
TrainerAvailabilityOverrideSchema.index({ trainerId: 1, status: 1 });

export const TrainerAvailabilityOverrideModel =
  mongoose.model<ITrainerAvailabilityOverride>(
    "TrainerAvailabilityOverride",
    TrainerAvailabilityOverrideSchema,
  );
