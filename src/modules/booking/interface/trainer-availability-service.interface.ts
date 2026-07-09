import { CreateAvailabilityDto } from "../dto/booking.dto";

export interface ITrainerAvailabilityService{
    createAvailability(trainerId: string, data:CreateAvailabilityDto):Promise<void>
}