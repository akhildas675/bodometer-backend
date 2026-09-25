import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { REVIEW_TYPES } from "../review.types";
import { IReviewService } from "../interface/review-service.interface";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { AppError } from "@/utils/appError";
import { REVIEW_MESSAGES } from "../constant/review.constant";
import {
  CreateReviewDto,
  ReviewQueryDto,
  UpdateReviewDto,
} from "../dto/review.dto";

@injectable()
export class ReviewController {
  constructor(
    @inject(REVIEW_TYPES.Service)
    private readonly _reviewService: IReviewService
  ) {}

  checkEligibility = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const { bookingId } = req.params;
      const result = await this._reviewService.checkEligibility(userId, bookingId);

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.ELIGIBILITY_CHECK_SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  createReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const dto = req.body as CreateReviewDto;
      const review = await this._reviewService.createReview(userId, dto);

      new SuccessResponse(
        STATUS.CREATED,
        REVIEW_MESSAGES.SUBMITTED_SUCCESS,
        review
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getReviewById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { reviewId } = req.params;
      const currentUserId = req.user?.id;
      const role = req.user?.role;

      const review = await this._reviewService.getReviewById(
        reviewId,
        currentUserId,
        role
      );

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.FETCHED_SUCCESS,
        review
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getUserReviews = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const query = req.query as unknown as ReviewQueryDto;
      const result = await this._reviewService.getUserReviews(userId, query);

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.LIST_FETCHED_SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  updateReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const { reviewId } = req.params;
      const dto = req.body as UpdateReviewDto;
      const updated = await this._reviewService.updateReview(
        userId,
        reviewId,
        dto
      );

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.UPDATED_SUCCESS,
        updated
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const { reviewId } = req.params;
      const role = req.user?.role;

      await this._reviewService.deleteReview(userId, reviewId, role);

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.REMOVED_SUCCESS,
        null
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerReviews = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const query = req.query as unknown as ReviewQueryDto;
      const result = await this._reviewService.getTrainerReviews(
        trainerId,
        query,
        true
      );

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.LIST_FETCHED_SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerSummary = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const summary = await this._reviewService.getTrainerRatingSummary(
        trainerId
      );

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.SUMMARY_FETCHED_SUCCESS,
        summary
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getPublicTrainerReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { trainerId } = req.params;
      const query = req.query as unknown as ReviewQueryDto;

      const result = await this._reviewService.getTrainerReviews(
        trainerId,
        query,
        false
      );

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.LIST_FETCHED_SUCCESS,
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getPublicTrainerSummary = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { trainerId } = req.params;
      const summary = await this._reviewService.getTrainerRatingSummary(
        trainerId
      );

      new SuccessResponse(
        STATUS.OK,
        REVIEW_MESSAGES.SUMMARY_FETCHED_SUCCESS,
        summary
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
