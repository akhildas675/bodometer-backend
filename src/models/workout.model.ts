import mongoose, { Document, Schema } from "mongoose";

export interface IWorkoutDocument extends Document {
  workoutName: string;
  workoutDescription: string;
  workoutImage: string;
  coverPhoto: string;
  introVideo: string;
  targetMuscles: string[];
  equipment: string[];
  benefits: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutSchema = new Schema<IWorkoutDocument>(
  {
    workoutName: {
      type: String,
      required: true,
      trim: true,
    },
    workoutDescription: {
      type: String,
      required: true,
      trim: true,
    },
    workoutImage: {
      type: String,
      required: true,
    },
    coverPhoto: {
      type: String,
      default: "",
    },
    introVideo: {
      type: String,
      default: "",
    },
    targetMuscles: {
      type: [String],
      default: [],
    },
    equipment: {
      type: [String],
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
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