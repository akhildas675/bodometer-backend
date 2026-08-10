export interface AvailableSlot {
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  bufferEndTime: string; // ISO timestamp
  formattedTime: string; // e.g., "09:00 AM - 10:00 AM"
  startMinute: number;
  endMinute: number;
}

export interface GetAvailableSlotsParams {
  trainerId: string;
  date: Date | string;
  serviceId: string;
}

export interface AvailableDateOverview {
  date: string; 
  isAvailable: boolean;
  status: "AVAILABLE" | "LEAVE" | "OFF" | "FULL";
  slotCount: number;
}

export interface GetAvailableDatesParams {
  trainerId: string;
  serviceId: string;
  month: string; 
}

export interface IBookingSlotEngineService {
  calculateAvailableSlots(params: GetAvailableSlotsParams): Promise<AvailableSlot[]>;
  calculateAvailableDatesOverview(params: GetAvailableDatesParams): Promise<AvailableDateOverview[]>;
}
