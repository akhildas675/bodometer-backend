import { IBaseRepository } from "../base/base-repository.interface";
import { TrainerAvailability } from "../../domain.interface/trainer-booking.interface";
import { ITrainerAvailabilityDocument } from "../../../models/trainer-availability.model";

import { PaginationMeta } from "../../domain.interface/common.interface";

export interface ITrainerAvailabilityRepository extends IBaseRepository<TrainerAvailability, ITrainerAvailabilityDocument> {
  findByTrainerId(trainerId: string): Promise<TrainerAvailability[]>;
  findByTrainerIdPaginated(trainerId: string, page: number, limit: number, sortBy?: string, sortOrder?: string, status?: string): Promise<{ data: TrainerAvailability[]; pagination: PaginationMeta }>;
  updateAvailabilityStatus(availabilityId: string, isActive: boolean): Promise<TrainerAvailability | null>;
}
