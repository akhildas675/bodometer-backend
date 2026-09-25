import { PaginationMeta } from "@/modules/base/interface/common.interface";
import {
  CreateReviewDto,
  PaginatedReviewsResponseDto,
  RatingSummaryResponseDto,
  ReviewEligibilityResponseDto,
  ReviewQueryDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from "../dto/review.dto";

export interface IReviewService {
  checkEligibility(
    userId: string,
    bookingId: string
  ): Promise<ReviewEligibilityResponseDto>;

  createReview(
    userId: string,
    dto: CreateReviewDto
  ): Promise<ReviewResponseDto>;

  getReviewById(
    reviewId: string,
    currentUserId?: string,
    role?: string
  ): Promise<ReviewResponseDto>;

  getUserReviews(
    userId: string,
    query: ReviewQueryDto
  ): Promise<{ reviews: ReviewResponseDto[]; pagination: PaginationMeta }>;

  updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto
  ): Promise<ReviewResponseDto>;

  deleteReview(
    userId: string,
    reviewId: string,
    role?: string
  ): Promise<void>;

  getTrainerReviews(
    trainerId: string,
    query: ReviewQueryDto,
    includeHidden?: boolean
  ): Promise<PaginatedReviewsResponseDto>;

  getTrainerRatingSummary(
    trainerId: string
  ): Promise<RatingSummaryResponseDto>;
}
