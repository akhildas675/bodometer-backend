import mongoose, { Document, Schema } from "mongoose";
import { BookingRescheduleRequest } from "../interface/domain/booking-reschedule-request.interface";

export interface IBookingRescheduleRequestDocument
  extends Omit<BookingRescheduleRequest, "id">,
    Document {}

const BookingRescheduleRequestSchema =
  new Schema<IBookingRescheduleRequestDocument>(
    {
      bookingId: {
        type: String,
        required: true,
        ref: "Booking",
        index: true,
      },
      requestedBy: {
        type: String,
        enum: ["USER", "TRAINER"],
        required: true,
      },
      requestedByUserId: {
        type: String,
        required: true,
        ref: "User",
      },
      oldStartTime: {
        type: Date,
        required: true,
      },
      oldEndTime: {
        type: Date,
        required: true,
      },
      proposedStartTime: {
        type: Date,
        required: true,
      },
      proposedEndTime: {
        type: Date,
        required: true,
      },
      proposedBufferEndTime: {
        type: Date,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"],
        default: "PENDING",
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      respondedAt: {
        type: Date,
      },
      responseReason: {
        type: String,
      },
    },
    {
      timestamps: true,
    },
  );

export const BookingRescheduleRequestModel =
  mongoose.model<IBookingRescheduleRequestDocument>(
    "BookingRescheduleRequest",
    BookingRescheduleRequestSchema,
  );
