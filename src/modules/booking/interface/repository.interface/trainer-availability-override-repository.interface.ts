import { ClientSession } from "mongoose";
import { TrainerAvailabilityOverride } from "../domain/trainer-availability-override.interface";
import { ITrainerAvailabilityOverride } from "../../model/trainer-availability-override.model";

export type CreateTrainerAvailabilityOverrideData = Omit<
  TrainerAvailabilityOverride,
  "id" | "createdAt" | "updatedAt"
>;

export interface ITrainerAvailabilityOverrideRepository {
  createOne(
    data: CreateTrainerAvailabilityOverrideData,
    session?: ClientSession
  ): Promise<TrainerAvailabilityOverride>;

  getByTrainerId(
    trainerId: string
  ): Promise<TrainerAvailabilityOverride[]>;

  findById(
    id: string
  ): Promise<TrainerAvailabilityOverride | null>;

  updateById(
    id: string,
    data: Partial<ITrainerAvailabilityOverride>,
    session?: ClientSession
  ): Promise<TrainerAvailabilityOverride | null>;

  deleteById(
    id: string,
    session?: ClientSession
  ): Promise<boolean>;
}
