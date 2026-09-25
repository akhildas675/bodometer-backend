import { Router } from "express";
import container from "@/container/container";
import { validate } from "@/middleware/validate";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { REVIEW_TYPES } from "../review.types";
import { ReviewController } from "../controller/review.controller";
import { REVIEW_PATHS } from "../constant/review.constant";
import {
  checkReviewEligibilitySchema,
  createReviewSchema,
  deleteReviewSchema,
  getPublicTrainerReviewsSchema,
  getPublicTrainerSummarySchema,
  getReviewByIdSchema,
  getReviewsQuerySchema,
  updateReviewSchema,
} from "../validation/review.validation";

const reviewRoute = Router();

const reviewController = container.get<ReviewController>(REVIEW_TYPES.Controller);


reviewRoute.get(
  REVIEW_PATHS.TRAINER_SUMMARY,
  ROLE_GUARD.TRAINER_GUARD,
  reviewController.getTrainerSummary,
);

reviewRoute.get(
  REVIEW_PATHS.TRAINER_REVIEWS,
  ROLE_GUARD.TRAINER_GUARD,
  validate(getReviewsQuerySchema),
  reviewController.getTrainerReviews,
);

reviewRoute.get(
  REVIEW_PATHS.PUBLIC_TRAINER_SUMMARY,
  validate(getPublicTrainerSummarySchema),
  reviewController.getPublicTrainerSummary,
);

reviewRoute.get(
  REVIEW_PATHS.PUBLIC_TRAINER_REVIEWS,
  validate(getPublicTrainerReviewsSchema),
  reviewController.getPublicTrainerReviews,
);


reviewRoute.get(
  REVIEW_PATHS.ELIGIBILITY,
  ROLE_GUARD.USER_GUARD,
  validate(checkReviewEligibilitySchema),
  reviewController.checkEligibility,
);

reviewRoute.get(
  REVIEW_PATHS.MY_REVIEWS,
  ROLE_GUARD.USER_GUARD,
  validate(getReviewsQuerySchema),
  reviewController.getUserReviews,
);

reviewRoute.post(
  REVIEW_PATHS.CREATE,
  ROLE_GUARD.USER_GUARD,
  validate(createReviewSchema),
  reviewController.createReview,
);

reviewRoute.patch(
  REVIEW_PATHS.BY_ID,
  ROLE_GUARD.USER_GUARD,
  validate(updateReviewSchema),
  reviewController.updateReview,
);

reviewRoute.delete(
  REVIEW_PATHS.BY_ID,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(deleteReviewSchema),
  reviewController.deleteReview,
);

reviewRoute.get(
  REVIEW_PATHS.BY_ID,
  ROLE_GUARD.OPTIONAL_AUTH,
  validate(getReviewByIdSchema),
  reviewController.getReviewById,
);

export default reviewRoute;
