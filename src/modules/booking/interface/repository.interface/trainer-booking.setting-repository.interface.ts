import { ClientSession } from "mongoose";
import { TrainerBookingSettings } from "../domain/trainer.booking-settings.interface";

export type CreateTrainerBookingSettingsData =
    Omit<
        TrainerBookingSettings,
        "id" |
        "createdAt" |
        "updatedAt"
    >;

export interface ITrainerBookingSettingsRepository {

    createBookingSettings(
        data: CreateTrainerBookingSettingsData,
        session?: ClientSession,
    ): Promise<TrainerBookingSettings>;

    getByTrainerId(
        trainerId: string,
    ): Promise<TrainerBookingSettings | null>;

    deleteById(
        id: string,
    ): Promise<boolean>;

    updateByTrainerId(
        trainerId: string,
        data: Partial<CreateTrainerBookingSettingsData>,
        session?: ClientSession,
    ): Promise<TrainerBookingSettings | null>;
}