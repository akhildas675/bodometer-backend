import { ITrainerProfileDocument } from "../../../models/trainer-profile.model";
import { IBaseRepository } from "../../base/base-repository.interface";
import { PaginationMeta } from "../../domain.interface/common.interface";
import {
  ITrainerWithProfile,
  ReapplyTrainerData,
  TrainerProfile,
  TrainerStatusResponse,
} from "../../domain.interface/trainer.interface";

export interface ITrainerProfileRepository extends IBaseRepository<
  TrainerProfile,
  ITrainerProfileDocument
> {
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

  getApprovedTrainersPaginated(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    specializationId?: string,
  ): Promise<{ data: ITrainerWithProfile[]; total: number }>;

  getTrainerByIdWithUser(
    trainerId: string,
  ): Promise<ITrainerWithProfile | null>;

  findRelatedTrainers(
    specializationIds: string[],
    excludeProfileId: string,
    limit: number,
  ): Promise<ITrainerWithProfile[]>;
}
