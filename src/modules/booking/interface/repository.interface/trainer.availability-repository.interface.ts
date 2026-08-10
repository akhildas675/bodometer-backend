import { ClientSession } from "mongoose";
import { TrainerAvailability } from "../domain/trainer-availability.interface";

export type CreateTrainerAvailabilityData =
    Omit<
        TrainerAvailability,
        "id" |
        "createdAt" |
        "updatedAt"
    >;

    export type UpdateTrainerAvailabilityData = Omit<
  TrainerAvailability,
  "id" | "trainerId" | "createdAt" | "updatedAt"
>;


export interface ITrainerAvailabilityRepository {

    createAvailability(
        data: CreateTrainerAvailabilityData,
        session?: ClientSession,
    ): Promise<TrainerAvailability>;

    getByTrainerId(
        trainerId: string,
    ): Promise<TrainerAvailability | null>;

    deleteById(
        id: string,
    ): Promise<boolean>;
      updateByTrainerId(
    trainerId: string,
    data: UpdateTrainerAvailabilityData,
    session?: ClientSession,
  ): Promise<TrainerAvailability | null>;

}


