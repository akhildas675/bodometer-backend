import mongoose, { Schema, Document } from "mongoose";

export interface IUserFitnessProfile extends Document {
  userId:                     mongoose.Types.ObjectId;
  preferredWorkout: mongoose.Types.ObjectId[];
  fitnessGoals:               string[];
  preferredWorkoutTime:       string;
  fitnessLevel:               string;
  createdAt:                  Date;
  updatedAt:                  Date;
}

const UserFitnessProfileSchema = new Schema<IUserFitnessProfile>(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,
    },
    preferredWorkout: [
      { type: Schema.Types.ObjectId, ref: "Workout" },
    ],
    fitnessGoals:         [{ type: String }],
    preferredWorkoutTime: { type: String, required: true },
    fitnessLevel:         { type: String, required: true },
  },
  { timestamps: true }
);

export const UserFitnessProfileModel = mongoose.model(
  "UserFitnessProfile",
  UserFitnessProfileSchema
);