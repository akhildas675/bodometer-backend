import { Types } from "mongoose";

export interface TimeWindow {
  startTime: string; // HH:mm
  endTime: string;
}

export interface TrainerAvailability {
  _id?: Types.ObjectId | string;
  trainerId: Types.ObjectId | string;
  startDate: Date;
  endDate: Date;
  timeWindows: TimeWindow[];
  sessionDuration: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
