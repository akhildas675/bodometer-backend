import mongoose, { Schema, Document } from "mongoose";

export type QuestionType =
  | "boolean"
  | "single_select"
  | "multi_select"
  | "text"
  | "number"
  | "time"
  | "number_stepper";

export interface IOnboardingQuestion extends Document {
  // Developer-controlled (locked)
  key:          string;       // unique identifier e.g. "strength_level"
  schemaKey:    string | null;// maps to Layer 1 field e.g. "strengthLevel" | null for Layer 3
  isCoreLocked: boolean;      // true = admin cannot change option values

  // Admin-editable (display only)
  question:  string;          // question text shown to user
  section:   string;          // "fitness" | "medical" | "workout" | "daily_habits"
  order:     number;          // display order within section
  isActive:  boolean;         // admin can hide/show

  // Question config
  type: QuestionType;

  options?: {
    label:         string;   // admin can edit this
    value:         string;   // LOCKED — developer only — maps to enum constant
    hasExtraInput?: boolean;
    placeholder?:  string;
  }[];

  followUp?: {
    when:         string | boolean;
    type:         "text" | "number";
    key:          string;
    placeholder?: string;
  };

  config?: {
    min?:  number;
    max?:  number;
    step?: number;
    unit?: string;
  };

  validation?: {
    required?: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const OnboardingQuestionSchema = new Schema<IOnboardingQuestion>(
  {
    // Developer-locked fields
    key:          { type: String, required: true, unique: true },
    schemaKey:    { type: String, default: null },   // null = Layer 3 question
    isCoreLocked: { type: Boolean, default: false }, // true = option values locked

    // Admin-editable fields
    question: { type: String, required: true },
    section:  { type: String, required: true },
    order:    { type: Number, required: true },
    isActive: { type: Boolean, default: true },

    // Question config
    type: {
      type:     String,
      required: true,
      enum:     ["boolean", "single_select", "multi_select", "text", "number", "time", "number_stepper"],
    },

    options: [
      {
        label:         String,
        value:         String,  // locked when isCoreLocked = true
        hasExtraInput: Boolean,
        placeholder:   String,
      },
    ],

    followUp: {
      when:        Schema.Types.Mixed,
      type:        String,
      key:         String,
      placeholder: String,
    },

    config: {
      min:  Number,
      max:  Number,
      step: Number,
      unit: String,
    },

    validation: {
      required: Boolean,
    },
  },
  { timestamps: true }
);

export const OnboardingQuestionModel = mongoose.model(
  "OnboardingQuestion",
  OnboardingQuestionSchema
);