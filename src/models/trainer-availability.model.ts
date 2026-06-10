import mongoose, { Document, Schema } from "mongoose";

export interface ITimeWindow {
  startTime: string;
  endTime: string;
}

export interface ITrainerAvailabilityDocument extends Document {
  trainerId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  timeWindows: ITimeWindow[];
  sessionDuration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeWindowSchema = new Schema<ITimeWindow>({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const TrainerAvailabilitySchema = new Schema<ITrainerAvailabilityDocument>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    timeWindows: {
      type: [TimeWindowSchema],
      required: true,
      validate: [
        { validator: (val: ITimeWindow[]) => val.length > 0, message: "At least one time window is required" },
        { validator: (val: ITimeWindow[]) => val.length <= 4, message: "Maximum of 4 time windows allowed" }
      ]
    },
    sessionDuration: {
      type: Number,
      required: true,
      enum: [30, 45, 60, 90, 120],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const TrainerAvailabilityModel = mongoose.model<ITrainerAvailabilityDocument>(
  "TrainerAvailability",
  TrainerAvailabilitySchema
);
