import { IBaseRepository } from "../base/base-repository.interface";
import { PopulatedTrainerBooking, TrainerBooking } from "../../domain.interface/trainer-booking.interface";
import { BookingStatus, ITrainerBookingDocument } from "../../../models/trainer-booking.model";
import { PaginationMeta } from "../../domain.interface/common.interface";

export interface ITrainerBookingRepository extends IBaseRepository<TrainerBooking, ITrainerBookingDocument> {
  findByUserIdPaginated(userId: string, page: number, limit: number, status?: BookingStatus, date?: Date, search?: string, sortBy?: string, sortOrder?: string): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }>;
  findByTrainerIdPaginated(trainerId: string, page: number, limit: number, status?: BookingStatus, date?: Date, search?: string, sortBy?: string, sortOrder?: string): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }>;

  updateStatus(bookingId: string, updates: Partial<ITrainerBookingDocument>): Promise<PopulatedTrainerBooking | null>;
  findPopulatedById(bookingId: string): Promise<PopulatedTrainerBooking | null>;
  hasOverlappingBooking(trainerId: string, date: Date, startTime: string, endTime: string): Promise<boolean>;
  hasActiveBookingsBetweenDates(trainerId: string, startDate: Date, endDate: Date): Promise<boolean>;
}
