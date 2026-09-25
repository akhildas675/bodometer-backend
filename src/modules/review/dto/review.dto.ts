import { PaginationMetaDto } from "@/dto/common.dto";
import { ReviewSortField, ReviewStatus } from "../constant/review.constant";

export interface CreateReviewDto {
  bookingId: string;
  videoSessionId?: string;
  rating: number;
  feedback?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  feedback?: string;
}

export interface ReviewAuthorDto {
  id: string;
  name: string;
  profilePic: string | null;
}

export interface ReviewResponseDto {
  id: string;
  bookingId: string;
  videoSessionId?: string;
  userId: string;
  trainerId: string;
  rating: number;
  feedback?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  author?: ReviewAuthorDto;
}

export interface RatingDistributionDto {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface RatingSummaryResponseDto {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistributionDto;
}

export interface ReviewQueryDto {
  page?: number;
  limit?: number;
  sortBy?: ReviewSortField;
  sortOrder?: "asc" | "desc";
  rating?: number;
}

export interface ReviewEligibilityResponseDto {
  eligible: boolean;
  bookingId: string;
  videoSessionId?: string;
  trainerId?: string;
  reason?: string;
  existingReviewId?: string;
}

export interface PaginatedReviewsResponseDto {
  reviews: ReviewResponseDto[];
  pagination: PaginationMetaDto;
  summary?: RatingSummaryResponseDto;
}
