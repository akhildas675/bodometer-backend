import mongoose, { Schema, Document } from "mongoose";

import {
  DIFFICULTY_LEVEL,
  DifficultyLevel,
  WORKOUT_ENVIRONMENT,
} from "@/constants/fitness.constant";


export interface IExercise extends Document {
  key: string;

  title: string;

  description: string;

  instructions: string[];

  media: {
    image: string;
    videoUrl?: string;
  };

  categoryIds: mongoose.Types.ObjectId[];

  targetMuscleIds: mongoose.Types.ObjectId[];

  equipmentIds?: mongoose.Types.ObjectId[];

  difficulty: DifficultyLevel;

  workoutEnvironments: string[];

  isCompound: boolean;


  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    instructions: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],

    media: {
      image: {
        type: String,
        required: true,
        trim: true,
      },

      videoUrl: {
        type: String,
        trim: true,
      },
    },

    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    targetMuscleIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "TargetMuscle",
        required: true,
      },
    ],

    equipmentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Equipment",
      },
    ],

    difficulty: {
      type: String,
      enum: Object.values(DIFFICULTY_LEVEL),
      required: true,
      index: true,
    },

    workoutEnvironments: [
      {
        type: String,
        enum: Object.values(WORKOUT_ENVIRONMENT),
        required: true,
      },
    ],

    isCompound: {

      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ExerciseModel = mongoose.model<IExercise>(
  "Exercise",
  ExerciseSchema,
);
