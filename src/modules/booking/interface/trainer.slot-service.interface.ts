import { GetSlotsFilter, GetSlotsQuery, TrainerSlot } from "./trainer-slot.interface";
import { PaginatedResult } from "./booking.interface";

export interface ITrainerSlotService {
  generateTrainerSlot(availabilityId: string): Promise<void>;
  getTrainerSlots(trainerId: string, filter?: GetSlotsFilter): Promise<TrainerSlot[]>;
  getTrainerSlotsPaginated(trainerId: string, filter: GetSlotsQuery): Promise<PaginatedResult<TrainerSlot>>;
  getTrainerAvailableSlots(trainerId: string, userId?: string): Promise<TrainerSlot[]>;
  blockSlot(trainerId: string, slotId: string): Promise<void>;
  unblockSlot(trainerId: string, slotId: string): Promise<void>;
}
