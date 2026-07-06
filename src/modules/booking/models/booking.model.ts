import mongoose, { Document, Schema } from "mongoose";
import { BOOKING_STATUS, BookingStatus } from "@/constants/booking.constant";
import { Role, ROLES } from "@/constants/roles";

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;

  slotId: mongoose.Types.ObjectId;

  status: BookingStatus;

  cancelReason?: string;
  cancelledBy?: Role;

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    slotId: {
      type: Schema.Types.ObjectId,
      ref: "TrainerSlot",
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },

    cancelReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
      enum: Object.values(ROLES),
    },
  },
  {
    timestamps: true,
  },
);

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
