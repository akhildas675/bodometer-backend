import {
  ADVANCE_NOTICE_HOURS,
  AdvanceNoticeHours,
  BUFFER_TIME_MINUTES,
  BufferTimeMinutes,
  MAX_BOOKING_LIMITS,
  MaxBookingLimits,
} from "@/constants/constant.values.ts/booking.constant";
import mongoose, { Document } from "mongoose";

export interface ITrainerBookingSettings extends Document {
  trainerId: mongoose.Types.ObjectId;
  serviceIds: mongoose.Types.ObjectId[];
  advanceNoticeHours: AdvanceNoticeHours;
  bufferMinutes: BufferTimeMinutes;
  maximumBookingPerDay: MaxBookingLimits;
  createdAt?: Date;
  updatedAt?: Date;
}

const TrainerBookingSettingsSchema =
  new mongoose.Schema<ITrainerBookingSettings>(
    {
      trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      serviceIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Coaching",
          required: true,
        },
      ],
      advanceNoticeHours: {
        type: Number,
        enum: Object.values(ADVANCE_NOTICE_HOURS),
        required: true,
      },
      bufferMinutes: {
        type: Number,
        enum: Object.values(BUFFER_TIME_MINUTES),
        required: true,
      },
      maximumBookingPerDay: {
        type: Number,
        enum: Object.values(MAX_BOOKING_LIMITS),
        required: true,
      },
    },
    { timestamps: true },
  );

export const TrainerBookingSettingsModel = mongoose.model<ITrainerBookingSettings>(
  "TrainerBookingSettings",
  TrainerBookingSettingsSchema,
);
