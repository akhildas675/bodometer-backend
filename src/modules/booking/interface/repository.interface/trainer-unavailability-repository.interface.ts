import { ClientSession } from "mongoose";
import { TrainerUnavailability } from "../domain/trainer-unavailability.interface";
import { ITrainerUnavailability } from "../../model/trainer-unavailability.model";

export type CreateTrainerUnavailabilityData =
  Omit<
    TrainerUnavailability,
    "id" | "createdAt" | "updatedAt"
  >;

export interface ITrainerUnavailabilityRepository {
  createOne(
    data: CreateTrainerUnavailabilityData,
    session?: ClientSession
  ): Promise<TrainerUnavailability>;

  createMany(
    data: CreateTrainerUnavailabilityData[],
    session?: ClientSession
  ): Promise<TrainerUnavailability[]>;

  getByTrainerId(
    trainerId: string
  ): Promise<TrainerUnavailability[]>;

  findById(
    id: string
  ): Promise<TrainerUnavailability | null>;

  updateById(
    id: string,
    data: Partial<ITrainerUnavailability>,
    session?: ClientSession
  ): Promise<TrainerUnavailability | null>;

  deleteById(
    id: string,
    session?: ClientSession
  ): Promise<boolean>;
}