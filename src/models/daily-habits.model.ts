import mongoose, { Schema, Document } from "mongoose";

export interface IUserDailyHabits extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  wakeUpTime: string;
  sleepTime: string;
  mealsPerDay: number;
  avgWaterLiters: number;
  avgDailySteps: number;
  caffeine: boolean;
  alcohol: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserDailyHabitsSchema = new Schema<IUserDailyHabits>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    wakeUpTime: { type: String, required: true },
    sleepTime: { type: String, required: true },
    mealsPerDay: { type: Number, min: 0 },
    avgWaterLiters: { type: Number, min: 0 },
    avgDailySteps: { type: Number, min: 0 },
    caffeine: { type: Boolean, default: false },
    alcohol: { type: Boolean, default: false },
  },
  { timestamps: true },
);

UserDailyHabitsSchema.index({ userId: 1, date: 1 }, { unique: true });

export const UserDailyHabitsModel = mongoose.model(
  "UserDailyHabits",
  UserDailyHabitsSchema,
);
