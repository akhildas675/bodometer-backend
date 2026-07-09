import mongoose, { Document, Schema } from "mongoose";
import {
  SLOT_STATUS,
  SlotStatus,
} from "@/constants/constant.values.ts/booking.constant";

export interface ITrainerSlot extends Document {
  availabilityId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;

  startTime: Date;
  endTime: Date;

  status: SlotStatus;

  createdAt: Date;
  updatedAt: Date;
}

const TrainerSlotSchema = new Schema<ITrainerSlot>(
  {
    availabilityId: {
      type: Schema.Types.ObjectId,
      ref: "TrainerAvailability",
      required: true,
    },

    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(SLOT_STATUS),
      default: SLOT_STATUS.AVAILABLE,
    },
  },
  {
    timestamps: true,
  }
);

export const TrainerSlotModel = mongoose.model<ITrainerSlot>(
  "TrainerSlot",
  TrainerSlotSchema
);