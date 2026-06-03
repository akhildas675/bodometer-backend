"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const verification_constants_1 = require("../../constants/verification.constants");
const trainer_profile_model_1 = require("../../models/trainer-profile.model");
const base_repository_1 = require("../../repositories/base/base.repository");
class TrainerProfileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(trainer_profile_model_1.TrainerProfileModel);
    }
    toInterface(doc) {
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
            specializations: doc.specializations?.map((id) => id.toString()) ?? [],
        };
    }
    // Trainer own profile
    async findByUserId(userId) {
        return this.findOne({ userId });
    }
    async createProfile(data) {
        await trainer_profile_model_1.TrainerProfileModel.create(data);
    }
    async updateToReapply(userId, data) {
        await trainer_profile_model_1.TrainerProfileModel.updateOne({ userId }, {
            $set: {
                experienceInYears: data.experienceInYears,
                certifications: data.certifications,
                coverPhoto: data.coverPhoto,
                bio: data.bio,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                specializations: data.specializations?.map((id) => new mongoose_1.default.Types.ObjectId(id)) ?? [],
                verificationStatus: verification_constants_1.VERIFICATION_STATUS.PENDING,
                rejectionReason: null,
            },
            $inc: { applyCount: 1 },
        });
    }
    async fetchTrainerStatus(userId) {
        const profile = await trainer_profile_model_1.TrainerProfileModel.findOne({ userId }).populate("userId", "name");
        if (!profile)
            return null;
        return {
            name: profile.userId.name,
            verificationStatus: profile.verificationStatus,
            rejectionReason: profile.rejectionReason ?? null,
        };
    }
    //Admin: paginated list with user info
    async findAllWithUserPaginated(search, sortBy, sortOrder, page, limit, status) {
        const pageNum = page || 1;
        const limitNum = limit || 10;
        const skip = (pageNum - 1) * limitNum;
        const profileFilter = {};
        if (status)
            profileFilter.verificationStatus = status;
        const pipeline = [
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
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await trainer_profile_model_1.TrainerProfileModel.aggregate(countPipeline);
        const totalItems = countResult[0]?.total || 0;
        pipeline.push({ $skip: skip }, { $limit: limitNum });
        const trainerProfiles = await trainer_profile_model_1.TrainerProfileModel.aggregate(pipeline);
        const data = trainerProfiles.map((profile) => {
            const { userId, ...profileData } = profile;
            return {
                user: userId,
                profile: {
                    ...profileData,
                    userId: userId._id,
                },
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
    async findByIdWithUser(profileId) {
        const trainerProfile = await trainer_profile_model_1.TrainerProfileModel.findById(profileId)
            .populate({
            path: "userId",
            select: "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
        })
            .populate("specializations", "_id name")
            .lean();
        if (!trainerProfile)
            return null;
        const { userId, ...profileData } = trainerProfile;
        return {
            user: userId,
            profile: {
                ...profileData,
                userId: userId._id,
            },
        };
    }
    // admin: update verification status
    async updateVerificationStatus(profileId, status, rejectionReason) {
        const updateData = {
            verificationStatus: status,
        };
        if (rejectionReason !== undefined)
            updateData.rejectionReason = rejectionReason;
        return trainer_profile_model_1.TrainerProfileModel.findByIdAndUpdate(profileId, updateData, {
            new: true,
        }).lean();
    }
    async getApprovedTrainersPaginated(page, limit, search, sortBy, sortOrder, specializationId) {
        const skip = (page - 1) * limit;
        const matchStage = {
            verificationStatus: verification_constants_1.VERIFICATION_STATUS.APPROVED,
        };
        if (specializationId) {
            matchStage.specializations = new mongoose_1.default.Types.ObjectId(specializationId);
        }
        const pipeline = [
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
        }
        else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }
        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await trainer_profile_model_1.TrainerProfileModel.aggregate(countPipeline);
        const total = countResult[0]?.total || 0;
        pipeline.push({ $skip: skip }, { $limit: limit });
        const profiles = await trainer_profile_model_1.TrainerProfileModel.aggregate(pipeline);
        const data = profiles.map((profile) => {
            const { userId, ...profileData } = profile;
            return {
                user: userId,
                profile: {
                    ...profileData,
                    userId: userId._id,
                },
            };
        });
        return { data, total };
    }
    async getTrainerByIdWithUser(trainerId) {
        const profile = await trainer_profile_model_1.TrainerProfileModel.findOne({
            _id: new mongoose_1.default.Types.ObjectId(trainerId),
            verificationStatus: verification_constants_1.VERIFICATION_STATUS.APPROVED,
        })
            .populate({
            path: "userId",
            select: "_id name profilePic",
        })
            .populate("specializations", "_id name")
            .lean();
        if (!profile)
            return null;
        const { userId, ...profileData } = profile;
        return {
            user: userId,
            profile: {
                ...profileData,
                userId: userId._id,
            },
        };
    }
}
exports.default = TrainerProfileRepository;
