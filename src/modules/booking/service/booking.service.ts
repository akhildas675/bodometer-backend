import { inject, injectable } from "inversify";
import { IBookingService } from "../interface/booking-service.interface";
import { BOOKING_TYPES } from "../booking.types";
import { CreateAvailabilityDto } from "../dto/booking.dto";
import { ITrainerAvailabilityRepository } from "../interface/trainer.availability-repository.interface";

@injectable()
export default class BookingService implements IBookingService{
    constructor(
        @inject(BOOKING_TYPES.TrainerAvailabilityRepository)
        private _trainerAvailabilityRepository:ITrainerAvailabilityRepository
    ) {
        
    }

    async createAvailability(trainerId: string, data: CreateAvailabilityDto): Promise<void> {
        await this._trainerAvailabilityRepository.createAvailability({ trainerId, ...data })
    }
}