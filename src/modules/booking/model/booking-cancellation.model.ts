import mongoose, { Document, Schema } from "mongoose";
import { BookingCancellation } from "../interface/domain/booking-cancellation.interface";

export interface IBookingCancellationDocument
  extends Omit<BookingCancellation, "id">,
    Document {}

const BookingCancellationSchema = new Schema<IBookingCancellationDocument>(
  {
    bookingId: {
      type: String,
      required: true,
      ref: "Booking",
      index: true,
    },
    cancelledBy: {
      type: String,
      enum: ["USER", "TRAINER", "ADMIN", "SYSTEM"],
      required: true,
    },
    cancelledByUserId: {
      type: String,
      required: true,
      ref: "User",
    },
    reasonCode: {
      type: String,
      default: "OTHER",
    },
    reason: {
      type: String,
      required: true,
    },
    cancelledAt: {
      type: Date,
      default: Date.now,
    },
    refundEligible: {
      type: Boolean,
      default: false,
    },
    refundPercentage: {
      type: Number,
      default: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    policySnapshot: {
      policyName: { type: String, required: true },
      hoursNotice: { type: Number, required: true },
      refundPercentage: { type: Number, required: true },
      appliedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  },
);

export const BookingCancellationModel = mongoose.model<IBookingCancellationDocument>(
  "BookingCancellation",
  BookingCancellationSchema,
);
