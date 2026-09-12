import mongoose, { Document, Schema } from "mongoose";

export interface IBookingAttendance {
  status: "PENDING" | "ATTENDED" | "MISSED";
  markedAt?: Date;
  markedBy?: mongoose.Types.ObjectId;
}

export interface IBookingCancellationSummary {
  cancelledBy?: mongoose.Types.ObjectId;
  reason?: string;
  cancelledAt?: Date;
}

export interface IBookingServiceSnapshot {
  name: string;
  durationMinutes: number;
  bookingMode?: string;
}

export interface IBookingPricingSnapshot {
  baseAmount: number;
  discountAmount: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
}

export interface IBooking extends Document {
  bookingNumber: string;
  trainerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  availabilityId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  serviceSnapshot?: IBookingServiceSnapshot;
  pricing?: IBookingPricingSnapshot;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  bufferEndTime: Date;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "RESCHEDULE_PENDING" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | "EXPIRED";
  paymentId?: string;
  price: number;
  attendance: IBookingAttendance;
  cancellation?: IBookingCancellationSummary;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, index: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    availabilityId: { type: Schema.Types.ObjectId, ref: "TrainerAvailability", required: false },
    serviceId: { type: Schema.Types.ObjectId, ref: "Coaching", required: true, index: true },
    serviceSnapshot: {
      name: { type: String, default: "" },
      durationMinutes: { type: Number, default: 60 },
      bookingMode: { type: String, default: "ONLINE" },
    },
    pricing: {
      baseAmount: { type: Number, default: 0 },
      discountAmount: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
      currency: { type: String, default: "inr" },
    },
    bookingDate: { type: Date, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    bufferEndTime: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "RESCHEDULE_PENDING", "CANCELLED", "COMPLETED", "NO_SHOW", "EXPIRED"],
      default: "PENDING_PAYMENT",
      index: true,
    },
    paymentId: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    attendance: {
      status: {
        type: String,
        enum: ["PENDING", "ATTENDED", "MISSED"],
        default: "PENDING",
      },
      markedAt: { type: Date },
      markedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    cancellation: {
      cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, default: "" },
      cancelledAt: { type: Date },
    },
  },
  {
    timestamps: true,
  },
);

export const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);
