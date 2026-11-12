import mongoose, { Document, Schema } from "mongoose";

export type SlotLockStatus = "AVAILABLE" | "HELD" | "BOOKED";

export interface IBookingSlotSession extends Document {
  trainerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: SlotLockStatus;
  heldBy?: mongoose.Types.ObjectId;
  holdToken?: string;
  holdExpiresAt?: Date;
  bookingId?: mongoose.Types.ObjectId;
}

const BookingSlotSessionSchema = new Schema<IBookingSlotSession>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Coaching", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "HELD", "BOOKED"],
      default: "AVAILABLE",
    },
    heldBy: { type: Schema.Types.ObjectId, ref: "User" },
    holdToken: { type: String },
    holdExpiresAt: { type: Date },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true },
);

BookingSlotSessionSchema.index(
  { trainerId: 1, serviceId: 1, startTime: 1 },
  { unique: true },
);

export const BookingSlotSessionModel = mongoose.model<IBookingSlotSession>(
  "BookingSlotSession",
  BookingSlotSessionSchema,
);
