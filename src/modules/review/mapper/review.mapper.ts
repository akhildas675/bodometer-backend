import {
  PaginatedReviewsResponseDto,
  RatingSummaryResponseDto,
  ReviewAuthorDto,
  ReviewEligibilityResponseDto,
  ReviewResponseDto,
} from "../dto/review.dto";
import {
  Review,
  ReviewEligibilityResult,
  ReviewWithAuthor,
  TrainerRatingSummary,
} from "../interface/review.interface";
import { PaginationMeta } from "@/modules/base/interface/common.interface";

export class ReviewMapper {
  static toResponseDto(
    review: Review,
    author?: ReviewAuthorDto
  ): ReviewResponseDto {
    return {
      id: review.id,
      bookingId: review.bookingId,
      videoSessionId: review.videoSessionId,
      userId: review.userId,
      trainerId: review.trainerId,
      rating: review.rating,
      feedback: review.feedback,
      status: review.status,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      author,
    };
  }

  static toResponseDtoFromWithAuthor(item: ReviewWithAuthor): ReviewResponseDto {
    return this.toResponseDto(item.review, {
      id: item.author.id,
      name: item.author.name,
      profilePic: item.author.profilePic,
    });
  }

  static toSummaryResponseDto(
    summary: TrainerRatingSummary
  ): RatingSummaryResponseDto {
    return {
      averageRating: summary.averageRating,
      totalReviews: summary.totalReviews,
      distribution: {
        1: summary.distribution[1],
        2: summary.distribution[2],
        3: summary.distribution[3],
        4: summary.distribution[4],
        5: summary.distribution[5],
      },
    };
  }

  static toEligibilityResponseDto(
    result: ReviewEligibilityResult
  ): ReviewEligibilityResponseDto {
    return {
      eligible: result.eligible,
      bookingId: result.bookingId,
      videoSessionId: result.videoSessionId,
      trainerId: result.trainerId,
      reason: result.reason,
      existingReviewId: result.existingReviewId,
    };
  }

  static toPaginatedResponseDto(
    items: ReviewWithAuthor[],
    pagination: PaginationMeta,
    summary?: TrainerRatingSummary
  ): PaginatedReviewsResponseDto {
    return {
      reviews: items.map((item) => this.toResponseDtoFromWithAuthor(item)),
      pagination: {
        currentPage: pagination.currentPage,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.itemsPerPage,
        hasNextPage: pagination.hasNextPage,
        hasPreviousPage: pagination.hasPreviousPage,
      },
      summary: summary ? this.toSummaryResponseDto(summary) : undefined,
    };
  }
}
