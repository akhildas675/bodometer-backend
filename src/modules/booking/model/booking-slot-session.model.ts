import mongoose, { Document, Schema } from "mongoose";

export interface IBookingSlotSession extends Document {
  trainerId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  capacity: number;
  bookedCount: number;
  status: "ACTIVE" | "CLOSED";
}

const BookingSlotSessionSchema = new Schema<IBookingSlotSession>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Coaching", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED"],
      default: "ACTIVE",
    },
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
