import { CreateAvailabilityDto } from "../dto/booking.dto";

export interface IBookingService{
    createAvailability(trainerId: string, data:CreateAvailabilityDto):Promise<void>
}