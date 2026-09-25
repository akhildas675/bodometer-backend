import { IBaseRepository } from "@/modules/base/interface/base-repository.interface";
import { PaginationMeta } from "@/modules/base/interface/common.interface";
import { IReviewDocument } from "../model/review.model";
import {
  CreateReviewData,
  Review,
  ReviewFilterQuery,
  ReviewWithAuthor,
  TrainerRatingSummary,
  UpdateReviewData,
} from "./review.interface";
import { ReviewStatus } from "../constant/review.constant";

export interface IReviewRepository
  extends IBaseRepository<Review, IReviewDocument, CreateReviewData> {
  findByBookingId(bookingId: string): Promise<Review | null>;
  findByUserAndBooking(userId: string, bookingId: string): Promise<Review | null>;
  existsByBookingId(bookingId: string): Promise<boolean>;
  findTrainerReviewsPaginated(
    trainerId: string,
    query: ReviewFilterQuery,
  ): Promise<{ data: ReviewWithAuthor[]; pagination: PaginationMeta }>;
  findUserReviewsPaginated(
    userId: string,
    query: ReviewFilterQuery,
  ): Promise<{ data: Review[]; pagination: PaginationMeta }>;
  updateReview(
    reviewId: string,
    data: UpdateReviewData,
  ): Promise<Review | null>;
  updateStatus(
    reviewId: string,
    status: ReviewStatus,
  ): Promise<Review | null>;
  getTrainerRatingSummary(trainerId: string): Promise<TrainerRatingSummary>;
}
