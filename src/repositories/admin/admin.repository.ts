import { ROLES } from "../../constants/identity.constants";
import {
  AdminGetTrainersDto,
  AdminGetUsersDto,
} from "../../dto/admin/admin.dto";
import { IAdminRepository } from "../../interfaces/admin/admin-repository.interface";
import {
  AdminTrainerInterface,
  AdminUserInterface,
  Workout,
} from "../../interfaces/admin/admin.interface";
import {
  ITrainerWithProfile,
  PopulatedTrainerProfile,
} from "../../interfaces/trainer/trainer.interface";
import {
  ITrainerProfileDocument,
  TrainerProfileModel,
} from "../../models/trainer-profile.model";
import { IUserDocument, UserModel } from "../../models/user.model";
import { IWorkoutDocument, WorkoutModel } from "../../models/workout.model";
import { BaseRepository } from "../base/base.repository";

export default class AdminRepository
  extends BaseRepository<AdminUserInterface, IUserDocument>
  implements IAdminRepository {
  constructor() {
    super(UserModel);
  }

  protected toInterface(doc: IUserDocument): AdminUserInterface {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role as typeof ROLES.USER,
      isBlocked: doc.isBlocked,
      isVerified: doc.isVerified,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  // User management
  async findUsers(query: AdminGetUsersDto): Promise<AdminUserInterface[]> {

    const filter: Record<string, unknown> = { role: ROLES.USER };

  
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } }
    ];
  }

  
  const sort: Record<string, 1 | -1> = {};
  if (query.sortBy) {
    sort[query.sortBy] = query.sortOrder === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; 
  }

  const docs = await UserModel.find(filter)
    .select("-password")
    .sort(sort);
    
    return docs.map((doc) => this.toInterface(doc));
  }

  async updateUserStatus(userId: string, isBlocked: boolean): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { isBlocked } });
  }

  // Trainer management
  async findTrainers(
  query: AdminGetTrainersDto,
): Promise<{ trainers: AdminTrainerInterface[]; total: number }> {
  const filter: Record<string, unknown> = { role: ROLES.TRAINER };

  // Add search filter if search query exists
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }

  // Build sort object
  const sort: Record<string, 1 | -1> = {};
  if (query.sortBy) {
    sort[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;
  } else {
    // Default sort by createdAt descending (newest first)
    sort.createdAt = -1;
  }

  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (page - 1) * limit;

  // Get total count for pagination
  const total = await UserModel.countDocuments(filter);

  // Get paginated data
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

  // Workout management
  async createWorkout(body: Workout): Promise<Workout> {
    const doc = new WorkoutModel(body);
    const saved = await doc.save();
    return this.toWorkoutInterface(saved);
  }

  async getAllWorkouts(): Promise<Workout[]> {
    const docs = await WorkoutModel.find();
    return docs.map((doc) => this.toWorkoutInterface(doc));
  }

  private toWorkoutInterface(doc: IWorkoutDocument): Workout {
    return {
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      isActive: doc.isActive,
    };
  }

  // Trainer profile management
  async getAllTrainersWithProfiles(): Promise<ITrainerWithProfile[]> {
    try {
      const trainerProfiles = await TrainerProfileModel.find()
        .populate<{ userId: IUserDocument }>({
          path: "userId",
          select:
            "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
        })
        .lean<PopulatedTrainerProfile[]>();

      const trainersWithProfiles: ITrainerWithProfile[] = trainerProfiles.map(
        (profile) => {
          const { userId, ...profileData } = profile;

          return {
            user: userId,
            profile: {
              ...profileData,
              userId: userId._id,
            } as ITrainerProfileDocument,
          };
        },
      );

      return trainersWithProfiles;
    } catch (error) {
      console.error("Error in getAllTrainersWithProfiles:", error);
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