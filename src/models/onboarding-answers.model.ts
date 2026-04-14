import mongoose, { Schema, Document } from "mongoose";

export interface IUserOnboardingAnswer extends Document {
  userId:      mongoose.Types.ObjectId;
  questionKey: string;              // matches OnboardingQuestion.key
  schemaKey:   string | null;       // null = not yet promoted to Layer 1

  answer: {
    value: string | number | boolean | string[];
    extra?: unknown;                    // for follow-up / "other" text inputs
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserOnboardingAnswerSchema = new Schema<IUserOnboardingAnswer>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
    questionKey: { type: String, required: true },
    schemaKey:   { type: String, default: null },

    answer: {
      value: { type: Schema.Types.Mixed, required: true },
      extra: { type: Schema.Types.Mixed },
    },
  },
  { timestamps: true }
);

// One answer per user per question
UserOnboardingAnswerSchema.index(
  { userId: 1, questionKey: 1 },
  { unique: true }
);

export const UserOnboardingAnswerModel = mongoose.model(
  "UserOnboardingAnswer",
  UserOnboardingAnswerSchema
);