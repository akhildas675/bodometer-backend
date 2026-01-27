import {
  AdminGetTrainersDto,
  AdminGetUsersDto,
} from "../../dto/admin/admin.dto";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";
import { ITrainerWithProfile } from "../trainer/trainer.interface";
import {
  AdminTrainerInterface,
  AdminUserInterface,
  Workout,
} from "./admin.interface";

export interface IAdminRepository {
  findUsers(query: AdminGetUsersDto): Promise<AdminUserInterface[]>;
  updateUserStatus(userId: string, isBlocked: boolean): Promise<void>;
  findTrainers(query: AdminGetTrainersDto): Promise<AdminTrainerInterface[]>;
  updateTrainerStatus(trainerId: string, isBlocked: boolean): Promise<void>;
  createWorkout(body: Workout): Promise<Workout>;
  getAllWorkouts(): Promise<Workout[]>;

  getAllTrainersWithProfiles(): Promise<ITrainerWithProfile[]>;

  getTrainerByProfileId(userId: string): Promise<ITrainerWithProfile | null>;

  updateTrainerVerificationStatus(
    profileId: string,
    status: string,
    rejectionReason?: string | null,
  ): Promise<ITrainerProfileDocument | null>;

  findTrainerProfileById(
    profileId: string,
  ): Promise<ITrainerProfileDocument | null>;
}
