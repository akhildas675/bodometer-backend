import { injectable } from "inversify";
import { Types } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import { PaginationMeta } from "@/modules/base/interface/common.interface";
import { IReviewRepository } from "../interface/review-repository.interface";
import { IReviewDocument, ReviewModel } from "../model/review.model";
import {
  CreateReviewData,
  RatingDistribution,
  RatingValue,
  Review,
  ReviewFilterQuery,
  ReviewWithAuthor,
  TrainerRatingSummary,
  UpdateReviewData,
} from "../interface/review.interface";
import {
  REVIEW_RULES,
  REVIEW_STATUS,
  ReviewStatus,
} from "../constant/review.constant";

interface PopulatedUserDoc {
  _id: Types.ObjectId;
  name?: string;
  profilePic?: string | null;
}

type ReviewDocWithUser = Omit<IReviewDocument, "userId"> & {
  userId: PopulatedUserDoc | Types.ObjectId;
};

@injectable()
export class ReviewRepository
  extends BaseRepository<Review, IReviewDocument, CreateReviewData>
  implements IReviewRepository
{
  constructor() {
    super(ReviewModel);
  }

  protected toInterface(doc: IReviewDocument | ReviewDocWithUser): Review {
    const rawUserId = doc.userId;
    let userIdStr = "";
    if (rawUserId instanceof Types.ObjectId) {
      userIdStr = rawUserId.toString();
    } else if (rawUserId && typeof rawUserId === "object" && "_id" in rawUserId) {
      userIdStr = String(rawUserId._id);
    }

    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      videoSessionId: doc.videoSessionId
        ? doc.videoSessionId.toString()
        : undefined,
      userId: userIdStr,
      trainerId: doc.trainerId.toString(),
      rating: doc.rating as RatingValue,
      feedback: doc.feedback,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  override async create(data: CreateReviewData): Promise<Review> {
    const doc = new this.model({
      bookingId: new Types.ObjectId(data.bookingId),
      videoSessionId: data.videoSessionId
        ? new Types.ObjectId(data.videoSessionId)
        : undefined,
      userId: new Types.ObjectId(data.userId),
      trainerId: new Types.ObjectId(data.trainerId),
      rating: data.rating,
      feedback: data.feedback?.trim() || undefined,
      status: data.status || REVIEW_STATUS.ACTIVE,
    });

    const saved = await doc.save();
    return this.toInterface(saved);
  }

  async findByBookingId(bookingId: string): Promise<Review | null> {
    const doc = await this.model
      .findOne({ bookingId: new Types.ObjectId(bookingId) })
      .exec();

    return doc ? this.toInterface(doc) : null;
  }

  async findByUserAndBooking(
    userId: string,
    bookingId: string
  ): Promise<Review | null> {
    const doc = await this.model
      .findOne({
        userId: new Types.ObjectId(userId),
        bookingId: new Types.ObjectId(bookingId),
      })
      .exec();

    return doc ? this.toInterface(doc) : null;
  }

  async existsByBookingId(bookingId: string): Promise<boolean> {
    const count = await this.model
      .countDocuments({ bookingId: new Types.ObjectId(bookingId) })
      .exec();

    return count > 0;
  }

  async findTrainerReviewsPaginated(
    trainerId: string,
    query: ReviewFilterQuery
  ): Promise<{ data: ReviewWithAuthor[]; pagination: PaginationMeta }> {
    const page = Math.max(1, query.page || REVIEW_RULES.DEFAULT_PAGE);
    const limit = Math.min(
      REVIEW_RULES.MAX_LIMIT,
      Math.max(1, query.limit || REVIEW_RULES.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      trainerId: new Types.ObjectId(trainerId),
      status: query.status || REVIEW_STATUS.ACTIVE,
    };

    if (query.rating && query.rating >= 1 && query.rating <= 5) {
      filter.rating = query.rating;
    }

    const sortField =
      query.sortBy === "rating" ? "rating" : REVIEW_RULES.DEFAULT_SORT_FIELD;
    const sortDirection = query.sortOrder === "asc" ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [docs, totalItems] = await Promise.all([
      this.model
        .find(filter)
        .populate<{ userId: PopulatedUserDoc }>("userId", "name profilePic")
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const data: ReviewWithAuthor[] = docs.map((doc) => {
      const populatedUser = doc.userId as unknown as PopulatedUserDoc | null;
      const authorName = populatedUser?.name || "Anonymous Client";
      const authorPic = populatedUser?.profilePic || null;
      const authorId =
        populatedUser?._id
          ? populatedUser._id.toString()
          : doc.userId instanceof Types.ObjectId
          ? doc.userId.toString()
          : "";

      return {
        review: this.toInterface(doc),
        author: {
          id: authorId,
          name: authorName,
          profilePic: authorPic,
        },
      };
    });

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findUserReviewsPaginated(
    userId: string,
    query: ReviewFilterQuery
  ): Promise<{ data: Review[]; pagination: PaginationMeta }> {
    const page = Math.max(1, query.page || REVIEW_RULES.DEFAULT_PAGE);
    const limit = Math.min(
      REVIEW_RULES.MAX_LIMIT,
      Math.max(1, query.limit || REVIEW_RULES.DEFAULT_LIMIT)
    );
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.status) {
      filter.status = query.status;
    }

    const sortField =
      query.sortBy === "rating" ? "rating" : REVIEW_RULES.DEFAULT_SORT_FIELD;
    const sortDirection = query.sortOrder === "asc" ? 1 : -1;
    const sortObj: Record<string, 1 | -1> = { [sortField]: sortDirection };

    const [docs, totalItems] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const data = docs.map((doc) => this.toInterface(doc));
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateReview(
    reviewId: string,
    data: UpdateReviewData
  ): Promise<Review | null> {
    const updatePayload: Partial<IReviewDocument> = {};

    if (data.rating !== undefined) {
      updatePayload.rating = data.rating;
    }
    if (data.feedback !== undefined) {
      updatePayload.feedback = data.feedback.trim() || undefined;
    }

    const doc = await this.model
      .findByIdAndUpdate(
        reviewId,
        { $set: updatePayload },
        { new: true, runValidators: true }
      )
      .exec();

    return doc ? this.toInterface(doc) : null;
  }

  async updateStatus(
    reviewId: string,
    status: ReviewStatus
  ): Promise<Review | null> {
    const doc = await this.model
      .findByIdAndUpdate(
        reviewId,
        { $set: { status } },
        { new: true, runValidators: true }
      )
      .exec();

    return doc ? this.toInterface(doc) : null;
  }

  async getTrainerRatingSummary(
    trainerId: string
  ): Promise<TrainerRatingSummary> {
    interface AggregationStats {
      totalReviews: number;
      avgRating: number;
    }

    interface AggregationDistribution {
      _id: number;
      count: number;
    }

    interface AggregationResult {
      stats: AggregationStats[];
      distribution: AggregationDistribution[];
    }

    const raw = await this.model
      .aggregate<AggregationResult>([
        {
          $match: {
            trainerId: new Types.ObjectId(trainerId),
            status: REVIEW_STATUS.ACTIVE,
          },
        },
        {
          $facet: {
            stats: [
              {
                $group: {
                  _id: null,
                  totalReviews: { $sum: 1 },
                  avgRating: { $avg: "$rating" },
                },
              },
            ],
            distribution: [
              {
                $group: {
                  _id: "$rating",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ])
      .exec();

    const stats = raw[0]?.stats?.[0];
    const distributionRaw = raw[0]?.distribution || [];

    const totalReviews = stats?.totalReviews ?? 0;
    const rawAvg = stats?.avgRating ?? 0;
    const averageRating = totalReviews > 0 ? Math.round(rawAvg * 10) / 10 : 0;

    const distribution: RatingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const item of distributionRaw) {
      if (item._id >= 1 && item._id <= 5) {
        distribution[item._id as keyof RatingDistribution] = item.count;
      }
    }

    return {
      averageRating,
      totalReviews,
      distribution,
    };
  }
}
