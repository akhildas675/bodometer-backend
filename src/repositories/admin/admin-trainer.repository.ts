import { AdminTrainerInterface, PaginationMeta } from "@/interfaces/admin/admin.interface";
import { IAdminTrainerRepository } from "@/interfaces/admin/admin.trainer-repository.interface";
import { ITrainerWithProfile, PopulatedTrainerProfile } from "@/interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument, TrainerProfileModel } from "@/models/trainer-profile.model";
import { IUserDocument, UserModel } from "@/models/user.model";
import { BaseRepository } from "@/repositories/base/base.repository";
import { ROLES } from "@/constants/roles";
import { AdminGetTrainersDto } from "@/dto/admin/admin-trainer.dto";

export default class AdminTrainerRepository extends BaseRepository<AdminTrainerInterface, IUserDocument> implements IAdminTrainerRepository {
    constructor() {
        super(UserModel)
    }

    protected toInterface(doc: IUserDocument):AdminTrainerInterface {
        return {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email,
            role: doc.role as typeof ROLES.TRAINER,
            isBlocked: doc.isBlocked,
            isVerified: doc.isVerified,
            createdAt: doc.createdAt.toISOString(),
        };
    }
    // Trainer management
    async findTrainers(
        query: AdminGetTrainersDto,
    ): Promise<{ trainers: AdminTrainerInterface[]; total: number }> {
        const filter: Record<string, unknown> = { role: ROLES.TRAINER };

        // Add search 
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: "i" } },
                { email: { $regex: query.search, $options: "i" } },
            ];
        }

        //  sort object
        const sort: Record<string, 1 | -1> = {};
        if (query.sortBy) {
            sort[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;
        } else {
            // default sort
            sort.createdAt = -1;
        }

        // pagination
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        // total count pagination
        const total = await UserModel.countDocuments({ role: "trainer" })



        // pagination
        const docs = await UserModel.find(filter)
            .select("-password")
            .sort(sort)
            .skip(skip)
            .limit(limit);

        const trainers = docs.map((doc) => this.toAdminTrainerInterface(doc));

        return { trainers, total };
    }

    async updateTrainerStatus(userId: string, isBlocked: boolean): Promise<void> {
        await UserModel.updateOne({ _id: userId }, { $set: { isBlocked } });
    }

    private toAdminTrainerInterface(doc: IUserDocument): AdminTrainerInterface {
        return {
            id: doc._id.toString(),
            name: doc.name,
            email: doc.email,
            role: doc.role as typeof ROLES.TRAINER,
            isBlocked: doc.isBlocked,
            isVerified: doc.isVerified,
            createdAt: doc.createdAt.toISOString(),
        };
    }


    // Trainer profile management
    async getAllTrainersWithProfiles(
        search?: string,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc',
        page?: number,
        limit?: number,
        status?: string
    ): Promise<{ data: ITrainerWithProfile[]; pagination: PaginationMeta }> {
        try {
            const pageNum = page || 1;
            const limitNum = limit || 10;
            const skip = (pageNum - 1) * limitNum;

            // Build match filter for verificationStatus
            const profileFilter: Record<string, any> = {};
            if (status) profileFilter.verificationStatus = status;

            // We need to filter by search on user fields, so use aggregation
            const pipeline: any[] = [
                { $match: profileFilter },
                {
                    $lookup: {
                        from: 'users', // your users collection name
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'userId',
                    },
                },
                { $unwind: '$userId' },
            ];

            // Search filter on user name or email
            if (search) {
                pipeline.push({
                    $match: {
                        $or: [
                            { 'userId.name': { $regex: search, $options: 'i' } },
                            { 'userId.email': { $regex: search, $options: 'i' } },
                        ],
                    },
                });
            }

            // Sort
            if (sortBy) {
                const sortField = ['name', 'email'].includes(sortBy)
                    ? `userId.${sortBy}`
                    : sortBy;
                pipeline.push({ $sort: { [sortField]: sortOrder === 'desc' ? -1 : 1 } });
            } else {
                pipeline.push({ $sort: { createdAt: -1 } });
            }

            // Count total before pagination
            const countPipeline = [...pipeline, { $count: 'total' }];
            const countResult = await TrainerProfileModel.aggregate(countPipeline);
            const totalItems = countResult[0]?.total || 0;

            // Paginate
            pipeline.push({ $skip: skip }, { $limit: limitNum });

            const trainerProfiles = await TrainerProfileModel.aggregate(pipeline);

            const data: ITrainerWithProfile[] = trainerProfiles.map((profile) => {
                const { userId, ...profileData } = profile;
                return {
                    user: userId,
                    profile: {
                        ...profileData,
                        userId: userId._id,
                    } as ITrainerProfileDocument,
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
        } catch (error) {
            console.error('Error in getAllTrainersWithProfiles:', error);
            throw error;
        }
    }
    async getTrainerByProfileId(
        profileId: string,
    ): Promise<ITrainerWithProfile | null> {
        try {
            const trainerProfile = await TrainerProfileModel.findById(profileId)
                .populate<{ userId: IUserDocument }>({
                    path: "userId",
                    select:
                        "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
                })
                .lean<PopulatedTrainerProfile>();

            if (!trainerProfile) {
                return null;
            }

            const { userId, ...profileData } = trainerProfile;

            return {
                user: userId,
                profile: {
                    ...profileData,
                    userId: userId._id,
                } as ITrainerProfileDocument,
            };
        } catch (error) {
            console.error("Error in getTrainerByProfileId:", error);
            throw error;
        }
    }

    async updateTrainerVerificationStatus(
        profileId: string,
        status: string,
        rejectionReason?: string | null,
    ): Promise<ITrainerProfileDocument | null> {
        try {
            const updateData: {
                verificationStatus: string;
                rejectionReason?: string | null;
            } = {
                verificationStatus: status,
            };

            if (rejectionReason !== undefined) {
                updateData.rejectionReason = rejectionReason;
            }

            const updatedProfile = await TrainerProfileModel.findByIdAndUpdate(
                profileId,
                updateData,
                { new: true },
            ).lean<ITrainerProfileDocument>();

            return updatedProfile;
        } catch (error) {
            console.error("Error in updateTrainerVerificationStatus:", error);
            throw error;
        }
    }

    async findTrainerProfileById(
        profileId: string,
    ): Promise<ITrainerProfileDocument | null> {
        try {
            const profile =
                await TrainerProfileModel.findById(profileId).lean<ITrainerProfileDocument>();
            return profile;
        } catch (error) {
            console.error("Error in findTrainerProfileById:", error);
            throw error;
        }
    }


}