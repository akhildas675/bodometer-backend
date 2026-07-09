import { CreateSlot, GetSlotsFilter, GetSlotsQuery, TrainerSlot } from "./trainer-slot.interface";
import { PaginatedResult } from "./booking.interface";
import { SlotStatus } from "@/constants/constant.values.ts/booking.constant";

export interface ITrainerSlotRepository {
  generateTrainerSlot(data: CreateSlot): Promise<TrainerSlot>;
  insertManySlots(slots: CreateSlot[]): Promise<void>;
  findSlotById(slotId: string): Promise<TrainerSlot | null>;
  findSlotsByTrainerId(trainerId: string, filter?: GetSlotsFilter, excludeRejectedForUserId?: string): Promise<TrainerSlot[]>;
  findSlotsByTrainerIdPaginated(trainerId: string, filter: GetSlotsQuery): Promise<PaginatedResult<TrainerSlot>>;
  findSlotsByIds(slotIds: string[]): Promise<TrainerSlot[]>;
  updateSlotStatus(slotId: string, status:SlotStatus): Promise<void>;
}

