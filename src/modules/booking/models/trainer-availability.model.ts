import { SLOT_DURATION, SlotDuration } from "@/constants/booking.constant";
import mongoose, { Document, Schema } from "mongoose";

export interface IShift {
  startTime: Date;
  endTime: Date;
  duration: SlotDuration,
}

export interface IAvailability {
  date: Date;
  shifts: IShift[];
}

export interface ITrainerAvailability extends Document {
  trainerId: mongoose.Types.ObjectId;
  availability: IAvailability[];
  createdAt: Date;
  updatedAt: Date;
}

const ShiftSchema = new Schema<IShift>(
  {
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      enum:Object.values(SLOT_DURATION),
      required: true,
    },
  },
  {
    _id: false,
  }
);

const AvailabilitySchema = new Schema<IAvailability>(
  {
    date: {
      type: Date,
      required: true,
    },
    shifts: {
      type: [ShiftSchema],
      default: [],
      required: true,
    },
  },
  {
    _id: false,
  }
);

const TrainerAvailabilitySchema = new Schema<ITrainerAvailability>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    availability: {
      type: [AvailabilitySchema],
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TrainerAvailabilityModel = mongoose.model<ITrainerAvailability>(
  "TrainerAvailability",
  TrainerAvailabilitySchema
);