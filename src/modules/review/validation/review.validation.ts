import { z } from "zod";
import {
  REVIEW_RATING,
  REVIEW_RULES,
  REVIEW_SORT_FIELDS,
} from "../constant/review.constant";

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const bookingIdParamSchema = z.string().regex(objectIdRegex, {
  message: "Invalid booking ID format.",
});

const reviewIdParamSchema = z.string().regex(objectIdRegex, {
  message: "Invalid review ID format.",
});

const trainerIdParamSchema = z.string().regex(objectIdRegex, {
  message: "Invalid trainer ID format.",
});

const ratingFieldSchema = z
  .number({
    message: "Rating is required and must be a number.",
  })
  .int({ message: "Rating must be an integer." })
  .min(REVIEW_RATING.MIN, {
    message: `Rating must be at least ${REVIEW_RATING.MIN}.`,
  })
  .max(REVIEW_RATING.MAX, {
    message: `Rating must not exceed ${REVIEW_RATING.MAX}.`,
  });

const feedbackFieldSchema = z
  .string()
  .trim()
  .min(1, { message: "Feedback cannot be empty if provided." })
  .max(REVIEW_RULES.MAX_FEEDBACK_LENGTH, {
    message: `Feedback must not exceed ${REVIEW_RULES.MAX_FEEDBACK_LENGTH} characters.`,
  })
  .optional();

export const checkReviewEligibilitySchema = z.object({
  params: z.object({
    bookingId: bookingIdParamSchema,
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: bookingIdParamSchema,
    videoSessionId: z
      .string()
      .regex(objectIdRegex, { message: "Invalid video session ID format." })
      .optional(),
    rating: ratingFieldSchema,
    feedback: feedbackFieldSchema,
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: reviewIdParamSchema,
  }),
  body: z
    .object({
      rating: ratingFieldSchema.optional(),
      feedback: feedbackFieldSchema,
    })
    .refine(
      (data) => data.rating !== undefined || data.feedback !== undefined,
      {
        message: "At least one of rating or feedback must be provided for update.",
      }
    ),
});

export const getReviewByIdSchema = z.object({
  params: z.object({
    reviewId: reviewIdParamSchema,
  }),
});

export const deleteReviewSchema = z.object({
  params: z.object({
    reviewId: reviewIdParamSchema,
  }),
});

export const getReviewsQuerySchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .regex(/^\d+$/, "Page must be a positive number.")
        .transform(Number)
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a positive number.")
        .transform(Number)
        .optional(),
      sortBy: z.enum(REVIEW_SORT_FIELDS).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      rating: z
        .string()
        .regex(/^[1-5]$/, "Rating filter must be between 1 and 5.")
        .transform(Number)
        .optional(),
    })
    .optional(),
});

export const getPublicTrainerReviewsSchema = z.object({
  params: z.object({
    trainerId: trainerIdParamSchema,
  }),
  query: z
    .object({
      page: z
        .string()
        .regex(/^\d+$/, "Page must be a positive number.")
        .transform(Number)
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a positive number.")
        .transform(Number)
        .optional(),
      sortBy: z.enum(REVIEW_SORT_FIELDS).optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
      rating: z
        .string()
        .regex(/^[1-5]$/, "Rating filter must be between 1 and 5.")
        .transform(Number)
        .optional(),
    })
    .optional(),
});

export const getPublicTrainerSummarySchema = z.object({
  params: z.object({
    trainerId: trainerIdParamSchema,
  }),
});
