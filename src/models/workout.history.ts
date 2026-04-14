import mongoose, { Schema, Document } from "mongoose";

export interface IUserWorkoutHistory extends Document {
  userId:             mongoose.Types.ObjectId;
  experienceDuration: string;
  strengthLevel:      string;
  trainedWithCoach:   boolean;
  trainingTypes:      string[];
  consistencyLevel:   string;
  weeklyTrainingDays: string;
  avgSessionDuration: string;
  goalIntensity:      string;
  createdAt:          Date;
  updatedAt:          Date;
}

const UserWorkoutHistorySchema = new Schema<IUserWorkoutHistory>(
  {
    userId:             { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    experienceDuration: { type: String, required: true },
    strengthLevel:      { type: String, required: true },
    trainedWithCoach:   { type: Boolean, required: true },
    trainingTypes:      { type: [String], default: [] },
    consistencyLevel:   { type: String, required: true },
    weeklyTrainingDays: { type: String, required: true },
    avgSessionDuration: { type: String, required: true },
    goalIntensity:      { type: String, required: true },
  },
  { timestamps: true }
);

export const UserWorkoutHistoryModel = mongoose.model(
  "UserWorkoutHistory",
  UserWorkoutHistorySchema
);