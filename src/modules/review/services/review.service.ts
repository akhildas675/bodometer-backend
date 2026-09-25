import { inject, injectable } from "inversify";
import { IReviewService } from "../interface/review-service.interface";
import { REVIEW_TYPES } from "../review.types";
import { IReviewRepository } from "../interface/review-repository.interface";
import { BOOKING_TYPES } from "@/modules/booking/booking.types";
import { IBookingRepository } from "@/modules/booking/interface/repository.interface/booking-repository.interface";
import { VIDEO_SESSION_TYPES } from "@/modules/video-session/video-session.types";
import { IVideoSessionRepository } from "@/modules/video-session/interface/video.session-repository.interface";
import {
  CreateReviewDto,
  PaginatedReviewsResponseDto,
  RatingSummaryResponseDto,
  ReviewEligibilityResponseDto,
  ReviewQueryDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from "../dto/review.dto";
import { RatingValue, ReviewEligibilityResult } from "../interface/review.interface";
import { ReviewMapper } from "../mapper/review.mapper";
import {
  REVIEW_MESSAGES,
  REVIEW_RATING,
  REVIEW_RULES,
  REVIEW_STATUS,
} from "../constant/review.constant";
import { BOOKING_STATUS } from "@/constants/constant.values.ts/booking.constant";
import { VIDEO_SESSION_STATUS } from "@/modules/video-session/constant/video-session.constant";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { ROLES } from "@/constants/constant.values.ts/roles";
import { AppError } from "@/utils/appError";
import { PaginationMeta } from "@/modules/base/interface/common.interface";

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject(REVIEW_TYPES.Repository)
    private readonly _reviewRepository: IReviewRepository,

    @inject(BOOKING_TYPES.BookingRepository)
    private readonly _bookingRepository: IBookingRepository,

    @inject(VIDEO_SESSION_TYPES.VideoSessionRepository)
    private readonly _videoSessionRepository: IVideoSessionRepository
  ) {}

  private async verifyEligibility(
    userId: string,
    bookingId: string
  ): Promise<ReviewEligibilityResult> {
    const booking = await this._bookingRepository.findById(bookingId);

    if (!booking) {
      return {
        eligible: false,
        reason: "Booking not found.",
        bookingId,
      };
    }

    if (booking.userId !== userId) {
      return {
        eligible: false,
        reason: "You are not authorized to review this session as you are not the client.",
        bookingId,
        trainerId: booking.trainerId,
      };
    }

    if (booking.trainerId === userId) {
      return {
        eligible: false,
        reason: REVIEW_MESSAGES.TRAINER_CANNOT_SELF_REVIEW,
        bookingId,
        trainerId: booking.trainerId,
      };
    }

    const existingReview = await this._reviewRepository.findByBookingId(bookingId);
    if (existingReview) {
      return {
        eligible: false,
        reason: REVIEW_MESSAGES.ALREADY_REVIEWED,
        bookingId,
        trainerId: booking.trainerId,
        existingReviewId: existingReview.id,
      };
    }

    // Verify session completion status: check both Booking and VideoSession lifecycle
    const videoSession = await this._videoSessionRepository.getVideoSessionByBookingId(
      bookingId
    );

    const isBookingCompleted = booking.status === BOOKING_STATUS.COMPLETED;
    const isVideoSessionCompleted =
      videoSession?.status === VIDEO_SESSION_STATUS.COMPLETED;

    if (!isBookingCompleted && !isVideoSessionCompleted) {
      return {
        eligible: false,
        reason: REVIEW_MESSAGES.SESSION_NOT_COMPLETED,
        bookingId,
        videoSessionId: videoSession?.id,
        trainerId: booking.trainerId,
      };
    }

    return {
      eligible: true,
      bookingId,
      videoSessionId: videoSession?.id,
      trainerId: booking.trainerId,
    };
  }

  async checkEligibility(
    userId: string,
    bookingId: string
  ): Promise<ReviewEligibilityResponseDto> {
    const result = await this.verifyEligibility(userId, bookingId);
    return ReviewMapper.toEligibilityResponseDto(result);
  }

  async createReview(
    userId: string,
    dto: CreateReviewDto
  ): Promise<ReviewResponseDto> {
    const eligibility = await this.verifyEligibility(userId, dto.bookingId);

    if (!eligibility.eligible) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        eligibility.reason || REVIEW_MESSAGES.NOT_ELIGIBLE
      );
    }

    if (
      !Number.isInteger(dto.rating) ||
      dto.rating < REVIEW_RATING.MIN ||
      dto.rating > REVIEW_RATING.MAX
    ) {
      throw new AppError(STATUS.BAD_REQUEST, REVIEW_MESSAGES.INVALID_RATING);
    }

    const sanitizedFeedback = dto.feedback?.trim();
    if (
      sanitizedFeedback &&
      sanitizedFeedback.length > REVIEW_RULES.MAX_FEEDBACK_LENGTH
    ) {
      throw new AppError(STATUS.BAD_REQUEST, REVIEW_MESSAGES.INVALID_FEEDBACK);
    }

    try {
      const review = await this._reviewRepository.create({
        bookingId: dto.bookingId,
        videoSessionId: dto.videoSessionId || eligibility.videoSessionId,
        userId,
        trainerId: eligibility.trainerId!,
        rating: dto.rating as RatingValue,
        feedback: sanitizedFeedback,
        status: REVIEW_STATUS.ACTIVE,
      });

      return ReviewMapper.toResponseDto(review);
    } catch (error: unknown) {
      const isMongoDuplicate =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: number }).code === 11000;

      if (isMongoDuplicate) {
        throw new AppError(STATUS.CONFLICT, REVIEW_MESSAGES.ALREADY_REVIEWED);
      }
      throw error;
    }
  }

  async getReviewById(
    reviewId: string,
    currentUserId?: string,
    role?: string
  ): Promise<ReviewResponseDto> {
    const review = await this._reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError(STATUS.NOT_FOUND, REVIEW_MESSAGES.NOT_FOUND);
    }

    const isAdmin = role === ROLES.ADMIN;
    const isOwner = currentUserId && review.userId === currentUserId;
    const isTargetTrainer = currentUserId && review.trainerId === currentUserId;

    if (review.status === REVIEW_STATUS.REMOVED && !isAdmin) {
      throw new AppError(STATUS.NOT_FOUND, REVIEW_MESSAGES.NOT_FOUND);
    }

    if (
      review.status === REVIEW_STATUS.HIDDEN &&
      !isAdmin &&
      !isOwner &&
      !isTargetTrainer
    ) {
      throw new AppError(STATUS.NOT_FOUND, REVIEW_MESSAGES.NOT_FOUND);
    }

    return ReviewMapper.toResponseDto(review);
  }

  async getUserReviews(
    userId: string,
    query: ReviewQueryDto
  ): Promise<{ reviews: ReviewResponseDto[]; pagination: PaginationMeta }> {
    const { data, pagination } =
      await this._reviewRepository.findUserReviewsPaginated(userId, query);

    const reviews = data.map((review) => ReviewMapper.toResponseDto(review));

    return {
      reviews,
      pagination,
    };
  }

  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto
  ): Promise<ReviewResponseDto> {
    const review = await this._reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError(STATUS.NOT_FOUND, REVIEW_MESSAGES.NOT_FOUND);
    }

    if (review.userId !== userId) {
      throw new AppError(STATUS.FORBIDDEN, REVIEW_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    if (review.status !== REVIEW_STATUS.ACTIVE) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Only active reviews can be modified."
      );
    }

    if (
      dto.rating !== undefined &&
      (!Number.isInteger(dto.rating) ||
        dto.rating < REVIEW_RATING.MIN ||
        dto.rating > REVIEW_RATING.MAX)
    ) {
      throw new AppError(STATUS.BAD_REQUEST, REVIEW_MESSAGES.INVALID_RATING);
    }

    const sanitizedFeedback = dto.feedback?.trim();
    if (
      sanitizedFeedback &&
      sanitizedFeedback.length > REVIEW_RULES.MAX_FEEDBACK_LENGTH
    ) {
      throw new AppError(STATUS.BAD_REQUEST, REVIEW_MESSAGES.INVALID_FEEDBACK);
    }

    const updated = await this._reviewRepository.updateReview(reviewId, {
      rating: dto.rating as RatingValue | undefined,
      feedback: sanitizedFeedback,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, REVIEW_MESSAGES.NOT_FOUND);
    }

    return ReviewMapper.toResponseDto(updated);
  }

  async deleteReview(
    userId: string,
    reviewId: string,
    role?: string
  ): Promise<void> {
    const review = await this._reviewRepository.findById(reviewId);

    if (!review) {
      throw new AppError(STATUS.NOT_FOUND, REVIEW_MESSAGES.NOT_FOUND);
    }

    const isAdmin = role === ROLES.ADMIN;
    const isOwner = review.userId === userId;

    if (!isOwner && !isAdmin) {
      throw new AppError(STATUS.FORBIDDEN, REVIEW_MESSAGES.UNAUTHORIZED_ACCESS);
    }

    await this._reviewRepository.updateStatus(reviewId, REVIEW_STATUS.REMOVED);
  }

  async getTrainerReviews(
    trainerId: string,
    query: ReviewQueryDto,
    includeHidden = false
  ): Promise<PaginatedReviewsResponseDto> {
    const effectiveQuery = {
      ...query,
      status: includeHidden ? undefined : REVIEW_STATUS.ACTIVE,
    };

    const [{ data, pagination }, summary] = await Promise.all([
      this._reviewRepository.findTrainerReviewsPaginated(
        trainerId,
        effectiveQuery
      ),
      this._reviewRepository.getTrainerRatingSummary(trainerId),
    ]);

    return ReviewMapper.toPaginatedResponseDto(data, pagination, summary);
  }

  async getTrainerRatingSummary(
    trainerId: string
  ): Promise<RatingSummaryResponseDto> {
    const summary = await this._reviewRepository.getTrainerRatingSummary(
      trainerId
    );
    return ReviewMapper.toSummaryResponseDto(summary);
  }
}
