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
}
