import { SlotStatus } from "@/constants/constant.values.ts/booking.constant";

export interface TrainerSlot {
  id: string;
  availabilityId: string;
  trainerId: string;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
  pendingBookingsCount?: number;
}

export interface CreateSlot {
  availabilityId: string;
  trainerId: string;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
}

export interface GetSlotsFilter {
  status?: SlotStatus;
  from?: Date;
  to?: Date;
}

export interface GetSlotsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: SlotStatus;
  date?: string; // YYYY-MM-DD
}
