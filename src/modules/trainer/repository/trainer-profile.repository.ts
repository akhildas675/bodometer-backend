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

  // Trainer own profile
  async findByUserId(userId: string): Promise<TrainerProfile | null> {
    return this.findOne({ userId });
  }

  async createProfile(data: Partial<ITrainerProfileDocument>): Promise<void> {
    await TrainerProfileModel.create(data);
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
          specializations:
            data.specializations?.map(
              (id: string) => new mongoose.Types.ObjectId(id),
            ) ?? [],
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
  //Admin: paginated list with user info
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

  // get single profile with populated user
  async findByIdWithUser(
    profileId: string,
  ): Promise<ITrainerWithProfile | null> {
    const trainerProfile = await TrainerProfileModel.findById(profileId)
      .populate<{ userId: IUserDocument }>({
        path: "userId",
        select:
          "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
      })
      .populate("specializations", "_id name")
      .lean<PopulatedTrainerProfile>();

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

  // admin: update verification status
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
  ): Promise<{ data: ITrainerWithProfile[]; total: number }> {
    const skip = (page - 1) * limit;

    const matchStage: Record<string, string | mongoose.Types.ObjectId> = {
      verificationStatus: VERIFICATION_STATUS.APPROVED,
    };
    if (specializationId) {
      matchStage.specializations = new mongoose.Types.ObjectId(
        specializationId,
      );
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
            { bio: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (sortBy) {
      const sortField = sortBy === "name" ? "userId.name" : sortBy;
      pipeline.push({ $sort: { [sortField]: sortOrder === "desc" ? -1 : 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" }];
    const countResult = await TrainerProfileModel.aggregate<{ total: number }>(
      countPipeline,
    );
    const total = countResult[0]?.total || 0;

    pipeline.push({ $skip: skip }, { $limit: limit });

    const profiles = await TrainerProfileModel.aggregate<
      ITrainerProfileDocument & { userId: IUserDocument }
    >(pipeline);

    const data: ITrainerWithProfile[] = profiles.map((profile: ITrainerProfileDocument & { userId: IUserDocument }) => {
      const { userId, ...profileData } = profile;
      return {
        user: userId,
        profile: {
          ...profileData,
          userId: userId._id,
        } as unknown as ITrainerProfileDocument,
      };
    });

    return { data, total };
  }

  async getTrainerByIdWithUser(
    trainerId: string,
  ): Promise<ITrainerWithProfile | null> {
    const profile = await TrainerProfileModel.findOne({
      _id: new mongoose.Types.ObjectId(trainerId),
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
    const objectIds = specializationIds.map(id => new mongoose.Types.ObjectId(id));
    
    const profiles = await TrainerProfileModel.find({
      _id: { $ne: new mongoose.Types.ObjectId(excludeProfileId) },
      verificationStatus: VERIFICATION_STATUS.APPROVED,
      specializations: { $in: objectIds }
    })
      .populate<{ userId: IUserDocument }>({
        path: "userId",
        select: "_id name profilePic",
      })
      .limit(limit)
      .lean<PopulatedTrainerProfile[]>();

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
