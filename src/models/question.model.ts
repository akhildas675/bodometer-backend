import {
  CONDITION_OPERATORS,
  ConditionOperator,
  DATA_SOURCES,
  DataSource,
  QUESTION_TYPES,
  QuestionType,
} from "@/constants/question.constant";
import { OnboardingValue } from "@/interfaces/domain.interface/onboarding.interface";
import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  key: string;

  question: string;

  description?: string;

  groupId: mongoose.Types.ObjectId;

  order: number;

  isActive: boolean;

  type: QuestionType;

  options?: {
    label: string;

    value: OnboardingValue;
  }[];

  dataSource?: DataSource;

  next?: {
    condition: {
      operator: ConditionOperator;

      value?: OnboardingValue;
    };

    nextQuestionId: mongoose.Types.ObjectId;
  }[];

  numberConfig?: {
    min?: number;

    max?: number;

    step?: number;

    unit?: string;
  };

  validation?: {
    required?: boolean;
  };

  createdBy: mongoose.Types.ObjectId;

  updatedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    question: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    groupId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionGroup",
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    type: {
      type: String,
      enum: QUESTION_TYPES,
      required: true,
    },

    options: [
      {
        label: String,

        value: Schema.Types.Mixed,
      },
    ],

    dataSource: {
      type: String,
      enum: DATA_SOURCES,
    },

    next: [
      {
        condition: {
          operator: {
            type: String,
            enum: CONDITION_OPERATORS,
            default: "equals",
          },

          value: Schema.Types.Mixed,
        },

        nextQuestionId: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
      },
    ],

    numberConfig: {
      min: Number,

      max: Number,

      step: Number,

      unit: String,
    },

    validation: {
      required: {
        type: Boolean,
        default: false,
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const QuestionModel = mongoose.model<IQuestion>(
  "Question",
  QuestionSchema,
);
