import { inject, injectable } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { CreateAvailabilityDto } from "../dto/booking.dto";
import { ITrainerAvailabilityRepository } from "../interface/trainer.availability-repository.interface";
import { ITrainerAvailabilityService } from "../interface/trainer-availability-service.interface";
import { AvailabilityCreate } from "../interface/trainer-availability.interface";
import { ITrainerSlotService } from "../interface/trainer.slot-service.interface";
import { TrainerAvailabilityValidation } from "../validation/trainer-availability.validation";

@injectable()
export default class TrainerAvailabilityService implements ITrainerAvailabilityService {
    constructor(
        @inject(BOOKING_TYPES.TrainerAvailabilityRepository)
        private _trainerAvailabilityRepository: ITrainerAvailabilityRepository,
        @inject(BOOKING_TYPES.TrainerSlotService)
        private _trainerSlotService: ITrainerSlotService,
        @inject(BOOKING_TYPES.TrainerAvailabilityValidation)
        private _trainerAvailabilityValidation:TrainerAvailabilityValidation,
    ) {

    }

 async createAvailability(
  trainerId: string,
  data: CreateAvailabilityDto
): Promise<void> {

  await this._trainerAvailabilityValidation.validateCreateAvailability(
    trainerId,
    data
  );

  const availabilityData: AvailabilityCreate = {
    trainerId,
    availability: [
      {
        date: data.date,
        shifts: data.shifts,
      },
    ],
  };

  const existing = await this._trainerAvailabilityRepository.findByTrainerId(trainerId);

  let result;
  if (!existing) {
    result = await this._trainerAvailabilityRepository.createAvailability(
      availabilityData
    );
  } else {
    const newAvailability = {
      date: data.date,
      shifts: data.shifts,
    };

    const existingAvailabilityIndex = existing.availability.findIndex(
      (a) => new Date(a.date).toDateString() === new Date(newAvailability.date).toDateString()
    );

    if (existingAvailabilityIndex !== -1) {
      existing.availability[existingAvailabilityIndex].shifts.push(...newAvailability.shifts);
    } else {
      existing.availability.push(newAvailability);
    }

    result = await this._trainerAvailabilityRepository.updateAvailability(
      existing.id,
      existing
    );
  }

  await this._trainerSlotService.generateTrainerSlot(result.id);
}



}