import mongoose, { Document, Schema, Types } from "mongoose";
import {
  REVIEW_RATING,
  REVIEW_RULES,
  REVIEW_STATUS,
  ReviewStatus,
} from "../constant/review.constant";

export interface IReviewDocument extends Document {
  bookingId: Types.ObjectId;
  videoSessionId?: Types.ObjectId;
  userId: Types.ObjectId;
  trainerId: Types.ObjectId;
  rating: number;
  feedback?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    videoSessionId: {
      type: Schema.Types.ObjectId,
      ref: "VideoSession",
      required: false,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: REVIEW_RATING.MIN,
      max: REVIEW_RATING.MAX,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer.",
      },
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: REVIEW_RULES.MAX_FEEDBACK_LENGTH,
      default: undefined,
    },
    status: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal queries and aggregation performance:
ReviewSchema.index({ trainerId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ trainerId: 1, status: 1, rating: 1 });

export const ReviewModel = mongoose.model<IReviewDocument>(
  "Review",
  ReviewSchema
);
