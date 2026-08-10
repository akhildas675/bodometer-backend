import mongoose, { Document, Schema } from "mongoose";

export interface IBookingAuditLog extends Document {
  bookingId: mongoose.Types.ObjectId;
  action:
    | "CREATED"
    | "STATUS_CHANGED"
    | "RESCHEDULED"
    | "RESCHEDULE_PROPOSED"
    | "RESCHEDULE_RESPONDED"
    | "CANCELLED"
    | "ATTENDANCE_MARKED";
  performedBy: mongoose.Types.ObjectId;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  createdAt?: Date;
}

const BookingAuditLogSchema = new Schema<IBookingAuditLog>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    action: {
      type: String,
      enum: [
        "CREATED",
        "STATUS_CHANGED",
        "RESCHEDULED",
        "RESCHEDULE_PROPOSED",
        "RESCHEDULE_RESPONDED",
        "CANCELLED",
        "ATTENDANCE_MARKED",
      ],
      required: true,
    },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    oldValue: { type: Schema.Types.Mixed, default: {} },
    newValue: { type: Schema.Types.Mixed, default: {} },
    reason: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const BookingAuditLogModel = mongoose.model<IBookingAuditLog>(
  "BookingAuditLog",
  BookingAuditLogSchema,
);
