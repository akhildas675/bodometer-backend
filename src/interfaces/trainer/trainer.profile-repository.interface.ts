import { IBaseRepository } from "@/interfaces/base/base-repository.interface";
import {
  TrainerProfile,
  TrainerStatusResponse,
  ReapplyTrainerData,
  ITrainerWithProfile,
} from "./trainer.interface";
import { ITrainerProfileDocument } from "@/models/trainer-profile.model";
import { PaginationMeta } from "@/interfaces/admin/admin.interface";

export interface ITrainerProfileRepository
  extends IBaseRepository<TrainerProfile, ITrainerProfileDocument> 
{
  // Trainer 
  findByUserId(userId: string): Promise<TrainerProfile | null>;
  createProfile(data: Partial<ITrainerProfileDocument>): Promise<void>;
  updateToReapply(userId: string, data: ReapplyTrainerData): Promise<void>;
  fetchTrainerStatus(userId: string): Promise<TrainerStatusResponse | null>;

  // Admin 
  findAllWithUserPaginated(
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<{ data: ITrainerWithProfile[]; pagination: PaginationMeta }>;

  findByIdWithUser(profileId: string): Promise<ITrainerWithProfile | null>;

  updateVerificationStatus(
    profileId: string,
    status: string,
    rejectionReason?: string | null,
  ): Promise<ITrainerProfileDocument | null>;
}