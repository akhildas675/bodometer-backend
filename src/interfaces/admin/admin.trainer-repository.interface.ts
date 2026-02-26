import { AdminGetTrainersDto } from "../../dto/admin/admin.dto";
import { ITrainerProfileDocument } from "../../models/trainer-profile.model";
import { ITrainerWithProfile } from "../trainer/trainer.interface";
import { AdminTrainerInterface, PaginatedResult } from "./admin.interface";

export interface IAdminTrainerRepository{
      findTrainers(
    query: AdminGetTrainersDto
  ): Promise<{ trainers: AdminTrainerInterface[]; total: number }>;
  updateTrainerStatus(trainerId: string, isBlocked: boolean): Promise<void>;

getAllTrainersWithProfiles(
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  page?: number,
  limit?: number,
  status?: string
): Promise<PaginatedResult<ITrainerWithProfile>>;
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