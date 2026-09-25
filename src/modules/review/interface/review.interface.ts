import { ReviewSortField, ReviewStatus } from "../constant/review.constant";

export type RatingValue = 1 | 2 | 3 | 4 | 5;

export interface Review {
  id: string;
  bookingId: string;
  videoSessionId?: string;
  userId: string;
  trainerId: string;
  rating: RatingValue;
  feedback?: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewData {
  bookingId: string;
  videoSessionId?: string;
  userId: string;
  trainerId: string;
  rating: RatingValue;
  feedback?: string;
  status?: ReviewStatus;
}

export interface UpdateReviewData {
  rating?: RatingValue;
  feedback?: string;
}

export interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface TrainerRatingSummary {
  averageRating: number;
  totalReviews: number;
  distribution: RatingDistribution;
}

export interface ReviewFilterQuery {
  page?: number;
  limit?: number;
  sortBy?: ReviewSortField;
  sortOrder?: "asc" | "desc";
  status?: ReviewStatus;
  rating?: number;
}

export interface ReviewUserSummary {
  id: string;
  name: string;
  profilePic: string | null;
}

export interface ReviewWithAuthor {
  review: Review;
  author: ReviewUserSummary;
}

export interface ReviewEligibilityResult {
  eligible: boolean;
  reason?: string;
  bookingId: string;
  videoSessionId?: string;
  trainerId?: string;
  existingReviewId?: string;
}
