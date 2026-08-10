import {
  CreateTrainerOverrideDto,
  CreateTrainerSchedulingSetupDto,
  SetupUnavailabilityDto,
  TrainerSchedulingSetupResponseDto,
  UpdateTrainerAvailabilityDto,
  UpdateTrainerBookingSettingsDto,
  UpdateTrainerOverrideDto,
} from "../../dto/trainer-scheduling.dto";
import { TrainerUnavailability } from "../domain/trainer-unavailability.interface";
import { TrainerAvailabilityOverride } from "../domain/trainer-availability-override.interface";

import { TrainerAvailability } from "../domain/trainer-availability.interface";

export interface ITrainerSchedulingService {
  createSetup(
    trainerId: string,
    data: CreateTrainerSchedulingSetupDto,
  ): Promise<void>;

  getSetup(
    trainerId: string,
  ): Promise<TrainerSchedulingSetupResponseDto>;

  updateAvailability(
    trainerId: string,
    data: UpdateTrainerAvailabilityDto,
  ): Promise<TrainerAvailability>;

  updateBookingSettings(
    trainerId: string,
    data: UpdateTrainerBookingSettingsDto,
  ): Promise<void>;

  createUnavailability(
    trainerId: string,
    data: SetupUnavailabilityDto,
  ): Promise<TrainerUnavailability>;

  getUnavailabilities(
    trainerId: string,
  ): Promise<TrainerUnavailability[]>;

  updateUnavailability(
    trainerId: string,
    unavailabilityId: string,
    data: Partial<SetupUnavailabilityDto>,
  ): Promise<TrainerUnavailability>;

  deleteUnavailability(
    trainerId: string,
    unavailabilityId: string,
  ): Promise<void>;

  createOverride(
    trainerId: string,
    data: CreateTrainerOverrideDto,
  ): Promise<TrainerAvailabilityOverride>;

  getOverrides(
    trainerId: string,
  ): Promise<TrainerAvailabilityOverride[]>;

  updateOverride(
    trainerId: string,
    overrideId: string,
    data: UpdateTrainerOverrideDto,
  ): Promise<TrainerAvailabilityOverride>;

  deleteOverride(
    trainerId: string,
    overrideId: string,
  ): Promise<void>;
}