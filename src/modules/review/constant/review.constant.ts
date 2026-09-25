export const REVIEW_STATUS = {
  ACTIVE: "ACTIVE",
  HIDDEN: "HIDDEN",
  REMOVED: "REMOVED",
} as const;

export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const REVIEW_RATING = {
  MIN: 1,
  MAX: 5,
} as const;

export const REVIEW_RULES = {
  MAX_FEEDBACK_LENGTH: 1000,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
  DEFAULT_SORT_FIELD: "createdAt",
  DEFAULT_SORT_ORDER: "desc" as const,
} as const;

export const REVIEW_SORT_FIELDS = ["createdAt", "rating"] as const;
export type ReviewSortField = (typeof REVIEW_SORT_FIELDS)[number];

export const REVIEW_PATHS = {
  ELIGIBILITY: "/eligibility/:bookingId",
  CREATE: "/",
  MY_REVIEWS: "/my-reviews",
  BY_ID: "/:reviewId",
  TRAINER_REVIEWS: "/trainer",
  TRAINER_SUMMARY: "/trainer/summary",
  PUBLIC_TRAINER_REVIEWS: "/trainer/:trainerId",
  PUBLIC_TRAINER_SUMMARY: "/trainer/:trainerId/summary",
} as const;

export const REVIEW_MESSAGES = {
  SUBMITTED_SUCCESS: "Review submitted successfully.",
  UPDATED_SUCCESS: "Review updated successfully.",
  REMOVED_SUCCESS: "Review removed successfully.",
  FETCHED_SUCCESS: "Review retrieved successfully.",
  LIST_FETCHED_SUCCESS: "Reviews retrieved successfully.",
  SUMMARY_FETCHED_SUCCESS: "Rating summary retrieved successfully.",
  ELIGIBILITY_CHECK_SUCCESS: "Review eligibility checked successfully.",
  NOT_FOUND: "Review not found.",
  NOT_ELIGIBLE: "You are not eligible to review this session.",
  ALREADY_REVIEWED: "A review has already been submitted for this session.",
  SESSION_NOT_COMPLETED: "Only completed sessions can be reviewed.",
  UNAUTHORIZED_ACCESS: "You are not authorized to perform this review action.",
  TRAINER_CANNOT_SELF_REVIEW: "Trainers cannot review their own sessions.",
  INVALID_RATING: "Rating must be an integer between 1 and 5.",
  INVALID_FEEDBACK: "Feedback must not exceed maximum allowed length.",
} as const;
