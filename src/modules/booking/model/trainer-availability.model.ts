import {
  AVAILABILITY_STATUS,
  AvailabilityStatus,
  DAY_OF_WEEK,
  DayOfWeek,
} from "@/constants/constant.values.ts/booking.constant";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface ITrainerAvailability extends Document {
  trainerId: Types.ObjectId;

  effectiveFrom: Date;

  effectiveUntil: Date;

  timeZone: string;

  weeklySchedule: IWeeklySchedule[];

  status: AvailabilityStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWeeklySchedule {
  dayOfWeek: DayOfWeek;

  isAvailable: boolean;

  shifts: IShift[];
}

export interface IShift {
  startMinute: number;

  endMinute: number;
}

const ShiftSchema = new Schema<IShift>(
  {
    startMinute: { type: Number, required: true },
    endMinute: { type: Number, required: true },
  },
  { _id: false },
);

const WeeklyScheduleSchema = new Schema<IWeeklySchedule>(
  {
    dayOfWeek: {
      type: String,
      enum: Object.values(DAY_OF_WEEK),
      required: true,
    },
    isAvailable: { type: Boolean, required: true },
    shifts: { type: [ShiftSchema], required: true },
  },
  { _id: false },
);

const TrainerAvailabilitySchema = new Schema<ITrainerAvailability>(
  {
    trainerId: { type: Types.ObjectId, required: true },
    effectiveFrom: { type: Date, required: true },
    effectiveUntil: { type: Date, required: true },
    timeZone: { type: String, required: true },
    weeklySchedule: { type: [WeeklyScheduleSchema], required: true },
    status: {
      type: String,
      enum: Object.values(AVAILABILITY_STATUS),
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const TrainerAvailabilityModel = mongoose.model<ITrainerAvailability>(
  "TrainerAvailability",
  TrainerAvailabilitySchema,
);

TrainerAvailabilitySchema.index({
  trainerId: 1,
  status: 1,
});

TrainerAvailabilitySchema.index({
  trainerId: 1,
  effectiveFrom: 1,
  effectiveUntil: 1,
});
