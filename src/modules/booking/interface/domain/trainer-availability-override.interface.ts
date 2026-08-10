export interface ShiftMinutes {
  startMinute: number;
  endMinute: number;
}

export interface TrainerAvailabilityOverride {
  id: string;
  trainerId: string;
  availabilityId?: string;
  date: Date;
  shifts: ShiftMinutes[];
  reason?: string;
  status: "ACTIVE" | "CANCELLED";
  createdAt?: Date;
  updatedAt?: Date;
}
