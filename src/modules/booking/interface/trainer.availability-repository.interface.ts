import { AvailabilityCreate, TrainerAvailability } from "./trainer-availability.interface";

export interface ITrainerAvailabilityRepository {
    createAvailability(data: AvailabilityCreate): Promise<TrainerAvailability>;
    updateAvailability(id: string, data: TrainerAvailability): Promise<TrainerAvailability>;
    findAvailabilityById(availabilityId: string): Promise<TrainerAvailability | null>;
    findByTrainerId(trainerId: string): Promise<TrainerAvailability | null>;
}