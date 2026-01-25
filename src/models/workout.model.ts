// models/workout.model.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWorkoutDocument extends Document {
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSchema = new Schema<IWorkoutDocument>(
  {
    workoutName: {
      type: String,
      required: true,
    },
    workoutDescription: {
      type: String,
      required: true,
    },
    workoutImage: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const WorkoutModel = mongoose.model<IWorkoutDocument>(
  "Workout",
  WorkoutSchema
);
