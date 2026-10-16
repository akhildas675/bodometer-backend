import mongoose, { PipelineStage } from "mongoose";
import {
  VERIFICATION_STATUS,
} from "@/constants/constant.values.ts/verification.constants";
import { PaginationMeta } from '@/modules/base/interface/common.interface';
import {
  ITrainerWithProfile,
  PopulatedTrainerProfile,
  ReapplyTrainerData,
  TrainerProfile,
  TrainerStatusResponse,
} from '@/modules/trainer/interface/trainer.interface';
import { ITrainerProfileRepository } from '@/modules/trainer/interface/trainer.profile-repository.interface';
import {
  ITrainerProfileDocument,
  TrainerProfileModel,
} from "@/modules/trainer/model/trainer-profile.model";
import { BaseRepository } from '@/modules/base/repository/base.repository';
import { IUserDocument } from "@/modules/auth/model/user.model";
import { CategoryModel } from "@/modules/category/models/category.model";
import { REVIEW_STATUS } from "@/modules/review/constant/review.constant";
import { injectable } from "inversify";

@injectable()
export default class TrainerProfileRepository
  extends BaseRepository<TrainerProfile, ITrainerProfileDocument>
  implements ITrainerProfileRepository
{
  constructor() {
    super(TrainerProfileModel);
  }

  protected toInterface(doc: ITrainerProfileDocument): TrainerProfile {
    return {
      userId: doc.userId.toString(),
      verificationStatus: doc.verificationStatus,
      coverPhoto: doc.coverPhoto,
      rejectionReason: doc.rejectionReason ?? null,
      bio: doc.bio,
      certifications: doc.certifications,
      experienceInYears: doc.experienceInYears,
      gender: doc.gender,
      dateOfBirth: doc.dateOfBirth,
      applyCount: doc.applyCount,
      specializations: doc.specializations?.map((id: mongoose.Types.ObjectId) => id.toString()) ?? [],
    };
  }

  async findByUserId(userId: string): Promise<TrainerProfile | null> {
    return this.findOne({ userId });
  }

  async createProfile(data: Partial<TrainerProfile>): Promise<void> {
    const doc = new TrainerProfileModel(data);
    await doc.save();
  }

  async updateToReapply(
    userId: string,
    data: ReapplyTrainerData,
  ): Promise<void> {
    await TrainerProfileModel.updateOne(
      { userId },
      {
        $set: {
          experienceInYears: data.experienceInYears,
          certifications: data.certifications,
          coverPhoto: data.coverPhoto,
          bio: data.bio,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          specializations: data.specializations ?? [],
          verificationStatus: VERIFICATION_STATUS.PENDING,
          rejectionReason: null,
        },
        $inc: { applyCount: 1 },
      },
    );
  }
  async fetchTrainerStatus(
    userId: string,
  ): Promise<TrainerStatusResponse | null> {
    const profile = await TrainerProfileModel.findOne({ userId }).populate<{
      userId: { name: string };
    }>("userId", "name");

    if (!profile) return null;

    return {
      name: profile.userId.name,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason ?? null,
    };
  }
  async findAllWithUserPaginated(
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<{ data: ITrainerWithProfile[]; pagination: PaginationMeta }> {
    const pageNum = page || 1;
    const limitNum = limit || 10;
    const skip = (pageNum - 1) * limitNum;

    const profileFilter: Record<string, string> = {};
    if (status) profileFilter.verificationStatus = status;

    const pipeline: PipelineStage[] = [
      { $match: profileFilter },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $lookup: {
          from: "categories",
          localField: "specializations",
          foreignField: "_id",
          as: "specializations",
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "userId.name": { $regex: search, $options: "i" } },
            { "userId.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (sortBy) {
      const sortField = ["name", "email"].includes(sortBy)
        ? `userId.${sortBy}`
        : sortBy;
      pipeline.push({ $sort: { [sortField]: sortOrder === "desc" ? -1 : 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" }];
    const countResult = await TrainerProfileModel.aggregate<{ total: number }>(
      countPipeline,
    );
    const totalItems = countResult[0]?.total || 0;

    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const trainerProfiles = await TrainerProfileModel.aggregate<
      ITrainerProfileDocument & { userId: IUserDocument }
    >(pipeline);

    const data: ITrainerWithProfile[] = trainerProfiles.map((profile: ITrainerProfileDocument & { userId: IUserDocument }) => {
      const { userId, ...profileData } = profile;
      return {
        user: userId,
        profile: {
          ...profileData,
          userId: userId._id,
        } as unknown as ITrainerProfileDocument,
      };
    });

    return {
      data,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
      },
    };
  }

  async findByIdWithUser(
    profileId: string,
  ): Promise<ITrainerWithProfile | null> {
    let trainerProfile = await TrainerProfileModel.findById(profileId)
      .populate<{ userId: IUserDocument }>({
        path: "userId",
        select:
          "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
      })
      .populate("specializations", "_id name")
      .lean<PopulatedTrainerProfile>();

    if (!trainerProfile) {
      trainerProfile = await TrainerProfileModel.findOne({ userId: profileId })
        .populate<{ userId: IUserDocument }>({
          path: "userId",
          select:
            "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
        })
        .populate("specializations", "_id name")
        .lean<PopulatedTrainerProfile>();
    }

    if (!trainerProfile) return null;

    const { userId, ...profileData } = trainerProfile;
    return {
      user: userId,
      profile: {
        ...profileData,
        userId: userId._id,
      } as ITrainerProfileDocument,
    };
  }

  async updateVerificationStatus(
    profileId: string,
    status: string,
    rejectionReason?: string | null,
  ): Promise<ITrainerProfileDocument | null> {
    const updateData: {
      verificationStatus: string;
      rejectionReason?: string | null;
    } = {
      verificationStatus: status,
    };
    if (rejectionReason !== undefined)
      updateData.rejectionReason = rejectionReason;

    return TrainerProfileModel.findByIdAndUpdate(profileId, updateData, {
      new: true,
    }).lean<ITrainerProfileDocument>();
  }

  async getApprovedTrainersPaginated(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    specializationId?: string,
    minExperience?: number,
    maxExperience?: number,
    minRating?: number,
  ): Promise<{ data: ITrainerWithProfile[]; total: number }> {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const matchStage: Record<string, unknown> = {
      verificationStatus: VERIFICATION_STATUS.APPROVED,
    };

    if (specializationId) {
      if (mongoose.Types.ObjectId.isValid(specializationId)) {
        matchStage.specializations = new mongoose.Types.ObjectId(specializationId);
      } else {
        const escaped = specializationId.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const matchingCategories = await CategoryModel.find({
          name: { $regex: new RegExp(`^${escaped}$`, "i") },
        }).select("_id");

        if (matchingCategories.length > 0) {
          matchStage.specializations = {
            $in: matchingCategories.map((c) => c._id),
          };
        } else {
          return { data: [], total: 0 };
        }
      }
    }

    if (minExperience !== undefined || maxExperience !== undefined) {
      const expFilter: Record<string, number> = {};
      if (minExperience !== undefined && !isNaN(Number(minExperience))) {
        expFilter.$gte = Number(minExperience);
      }
      if (maxExperience !== undefined && !isNaN(Number(maxExperience))) {
        expFilter.$lte = Number(maxExperience);
      }
      if (Object.keys(expFilter).length > 0) {
        matchStage.experienceInYears = expFilter;
      }
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $match: {
          "userId.isBlocked": { $ne: true },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "specializations",
          foreignField: "_id",
          as: "specializations",
        },
      },
      {
        $lookup: {
          from: "reviews",
          let: { trainerUserId: "$userId._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$trainerId", "$$trainerUserId"] },
                    { $eq: ["$status", REVIEW_STATUS.ACTIVE] },
                  ],
                },
              },
            },
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
              },
            },
          ],
          as: "ratingSummary",
        },
      },
      {
        $addFields: {
          avgRating: {
            $ifNull: [
              { $round: [{ $arrayElemAt: ["$ratingSummary.avgRating", 0] }, 1] },
              0,
            ],
          },
          totalReviews: {
            $ifNull: [{ $arrayElemAt: ["$ratingSummary.totalReviews", 0] }, 0],
          },
        },
      },
    ];

    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      pipeline.push({
        $match: {
          $or: [
            { "userId.name": { $regex: escaped, $options: "i" } },
            { bio: { $regex: escaped, $options: "i" } },
            { "specializations.name": { $regex: escaped, $options: "i" } },
          ],
        },
      });
    }

    if (minRating !== undefined && !isNaN(Number(minRating)) && Number(minRating) > 0) {
      pipeline.push({
        $match: {
          avgRating: { $gte: Number(minRating) },
        },
      });
    }

    if (sortBy === "rating") {
      const order = sortOrder === "asc" ? 1 : -1;
      pipeline.push({
        $sort: {
          avgRating: order,
          totalReviews: order,
          createdAt: -1,
        },
      });
    } else if (sortBy === "experienceInYears" || sortBy === "experience") {
      const order = sortOrder === "desc" ? -1 : 1;
      pipeline.push({
        $sort: {
          experienceInYears: order,
          createdAt: -1,
        },
      });
    } else if (sortBy === "name") {
      const order = sortOrder === "desc" ? -1 : 1;
      pipeline.push({
        $sort: {
          "userId.name": order,
          createdAt: -1,
        },
      });
    } else if (sortBy === "createdAt" || sortBy === "latest") {
      const order = sortOrder === "asc" ? 1 : -1;
      pipeline.push({
        $sort: {
          createdAt: order,
        },
      });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" }];
    const countResult = await TrainerProfileModel.aggregate<{ total: number }>(
      countPipeline,
    );
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: skip }, { $limit: limitNum });

    const profiles = await TrainerProfileModel.aggregate<
      ITrainerProfileDocument & {
        userId: IUserDocument;
        avgRating?: number;
        totalReviews?: number;
      }
    >(pipeline);

    const data: ITrainerWithProfile[] = profiles.map((profile) => {
      const { userId, avgRating, totalReviews, ...profileData } = profile;
      return {
        user: userId,
        profile: {
          ...profileData,
          userId: userId._id,
          avgRating: avgRating ?? 0,
          totalReviews: totalReviews ?? 0,
        } as unknown as ITrainerProfileDocument,
      };
    });

    return { data, total };
  }

  async getTrainerByIdWithUser(
    trainerId: string,
  ): Promise<ITrainerWithProfile | null> {
    const profile = await TrainerProfileModel.findOne({
      _id: trainerId,
      verificationStatus: VERIFICATION_STATUS.APPROVED,
    })
      .populate<{ userId: IUserDocument }>({
        path: "userId",
        select: "_id name profilePic",
      })
      .populate("specializations", "_id name")
      .lean<PopulatedTrainerProfile>();

    if (!profile) return null;

    const { userId, ...profileData } = profile;

    return {
      user: userId,
      profile: {
        ...profileData,
        userId: userId._id,
      } as ITrainerProfileDocument,
    };
  }

  async findRelatedTrainers(
    specializationIds: string[],
    excludeProfileId: string,
    limit: number,
  ): Promise<ITrainerWithProfile[]> {
    let profiles: PopulatedTrainerProfile[] = [];

    if (specializationIds.length > 0) {
      const filter: Record<string, unknown> = {
        verificationStatus: VERIFICATION_STATUS.APPROVED,
        specializations: { $in: specializationIds },
      };
      if (excludeProfileId) {
        filter._id = { $ne: excludeProfileId };
      }

      profiles = await TrainerProfileModel.find(filter)
        .populate<{ userId: IUserDocument }>({
          path: "userId",
          select: "_id name profilePic",
        })
        .populate("specializations", "_id name")
        .limit(limit)
        .lean<PopulatedTrainerProfile[]>();
    }

    if (profiles.length === 0) {
      profiles = await TrainerProfileModel.find({
        ...(excludeProfileId ? { _id: { $ne: excludeProfileId } } : {}),
        verificationStatus: VERIFICATION_STATUS.APPROVED,
      })
        .populate<{ userId: IUserDocument }>({
          path: "userId",
          select: "_id name profilePic",
        })
        .populate("specializations", "_id name")
        .limit(limit)
        .lean<PopulatedTrainerProfile[]>();
    }

    return profiles.map((profile) => {
      const { userId, ...profileData } = profile;
      return {
        user: userId,
        profile: {
          ...profileData,
          userId: userId._id,
        } as ITrainerProfileDocument,
      };
    });
  }
}
