import mongoose from "mongoose";
import { ROLES } from "../../constants/identity.constants";
import {
  AddWorkoutDto,
  AdminGetTrainersDto,
  AdminGetUsersDto,
} from "../../dto/admin/admin.dto";
import { AdminRepositoryInterface } from "../../interfaces/admin/admin-repository.interface";
import {
  AdminTrainerInterface,
  AdminUserInterface,
  Workout,
} from "../../interfaces/admin/admin.interface";
import { ITrainerWithProfile } from "../../interfaces/trainer/trainer.interface";
import { ITrainerProfileDocument, TrainerProfileModel } from "../../models/trainer-profile.model";
import { IUserDocument, UserModel } from "../../models/user.model";
import { IWorkoutDocument, WorkoutModel } from "../../models/workout.model";

export default class AdminRepository implements AdminRepositoryInterface {

  async findUsers(_query: AdminGetUsersDto): Promise<AdminUserInterface[]> {
    const docs = await UserModel.find({ role: ROLES.USER }).select("-password");
    return docs.map((doc) => this.toAdminUserInterface(doc));
  }
  async updateUserStatus(userId: string, isBlocked: boolean): Promise<void> {
    await UserModel.updateOne({ _id: userId }, { $set: { isBlocked } });
  }

  private toAdminUserInterface(doc: IUserDocument): AdminUserInterface {
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

  async findTrainers(_query: AdminGetTrainersDto,
  ): Promise<AdminTrainerInterface[]> {
    const docs = await UserModel.find({ role: ROLES.TRAINER }).select("-password",);
    return docs.map((doc) => this.toAdminTrainerInterface(doc));
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

 async createWorkout(body: Workout): Promise<Workout> {
    const doc = new WorkoutModel(body)
    const saved = await doc.save();
    return {
      id:saved._id.toString(),
      workoutName:saved.workoutName,
      workoutDescription:saved.workoutDescription,
      workoutImage:saved.workoutImage,
      isActive:saved.isActive
    }
  }

  async getAllWorkouts(): Promise<Workout[]> {
    const docs = await WorkoutModel.find();

    return docs.map(doc => ({
      id: doc._id.toString(),
      workoutName: doc.workoutName,
      workoutDescription: doc.workoutDescription,
      workoutImage: doc.workoutImage,
      isActive: doc.isActive,
    }));
  }

  async getAllTrainersWithProfiles(): Promise<ITrainerWithProfile[]> {
    try {
      // Find all trainer profiles
      const trainerProfiles = await TrainerProfileModel.find()
        .populate({
          path: "userId",
          select: "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
        })
        .lean();

      // Map to ITrainerWithProfile format
      const trainersWithProfiles: ITrainerWithProfile[] = trainerProfiles.map((profile) => ({
        user: profile.userId as any,
        profile: profile as any,
      }));

      return trainersWithProfiles;
    } catch (error) {
      console.error("Error in getAllTrainersWithProfiles:", error);
      throw error;
    }
  }

  async getTrainerByUserId(userId: string): Promise<ITrainerWithProfile | null> {
    try {
    
      const trainerProfile = await TrainerProfileModel.findOne({
        userId: new mongoose.Types.ObjectId(userId),
      })
        .populate({
          path: "userId",
          select: "_id name userName email phoneNumber profilePic gender role isVerified dateOfBirth isBlocked createdAt updatedAt",
        })
        .lean();

      if (!trainerProfile) {
        return null;
      }

      return {
        user: trainerProfile.userId as any,
        profile: trainerProfile as any,
      };
    } catch (error) {
      console.error("Error in getTrainerByUserId:", error);
      throw error;
    }
  }

  async updateTrainerVerificationStatus(
    profileId: string,
    status: string,
    rejectionReason?: string | null
  ): Promise<ITrainerProfileDocument | null> {
    try {
      const updateData: any = {
        verificationStatus: status,
      };

      if (rejectionReason !== undefined) {
        updateData.rejectionReason = rejectionReason;
      }

      const updatedProfile = await TrainerProfileModel.findByIdAndUpdate(
        profileId,
        updateData,
        { new: true }
      ).lean();

      return updatedProfile as any;
    } catch (error) {
      console.error("Error in updateTrainerVerificationStatus:", error);
      throw error;
    }
  }

  async findTrainerProfileById(profileId: string): Promise<ITrainerProfileDocument | null> {
    try {
      const profile = await TrainerProfileModel.findById(profileId).lean();
      return profile as any;
    } catch (error) {
      console.error("Error in findTrainerProfileById:", error);
      throw error;
    }
  }
}
