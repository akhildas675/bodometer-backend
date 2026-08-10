import mongoose, { Document, Schema } from "mongoose";
import { BookingRefund } from "../interface/domain/booking-refund.interface";

export interface IBookingRefundDocument
  extends Omit<BookingRefund, "id">,
    Document {}

const BookingRefundSchema = new Schema<IBookingRefundDocument>(
  {
    bookingId: {
      type: String,
      required: true,
      ref: "Booking",
      index: true,
    },
    paymentId: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    trainerId: {
      type: String,
      required: true,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "inr",
    },
    reason: {
      type: String,
      required: true,
    },
    triggeredBy: {
      type: String,
      enum: ["USER", "TRAINER", "ADMIN", "SYSTEM"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    gatewayRefundId: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    processedBy: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

export const BookingRefundModel = mongoose.model<IBookingRefundDocument>(
  "BookingRefund",
  BookingRefundSchema,
);
