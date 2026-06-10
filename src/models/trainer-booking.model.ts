import mongoose, { Document, Schema } from "mongoose";

export const BOOKING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  NO_SHOW: "no_show",
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export interface ITrainerBookingDocument extends Document {
  userId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  bookingReference: string;
  bookingType: "ONLINE" | "OFFLINE";
  bookingDate: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  userNotes: string;
  rejectionReason?: string;
  cancellationReason?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  statusUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerBookingSchema = new Schema<ITrainerBookingDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
    },
    bookingType: {
      type: String,
      enum: ["ONLINE", "OFFLINE"],
      default: "ONLINE",
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    userNotes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    cancelledAt: { type: Date },
    completedAt: { type: Date },
    statusUpdatedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index to prevent double booking. 
// We only enforce uniqueness if the status is PENDING or APPROVED.
TrainerBookingSchema.index(
  { trainerId: 1, bookingDate: 1, startTime: 1 },
  { 
    unique: true, 
    partialFilterExpression: { 
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.APPROVED] } 
    } 
  }
);

export const TrainerBookingModel = mongoose.model<ITrainerBookingDocument>(
  "TrainerBooking",
  TrainerBookingSchema
);
