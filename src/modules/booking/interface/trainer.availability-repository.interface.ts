import { AvailabilityCreate, TrainerAvailability } from "./booking.interface";

export interface ITrainerAvailabilityRepository{
    createAvailability(data:AvailabilityCreate):Promise<TrainerAvailability>
}