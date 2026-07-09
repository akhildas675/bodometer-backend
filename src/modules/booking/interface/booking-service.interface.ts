import { Role } from "@/constants/constant.values.ts/roles";
import {
  GetBookingsFilter,
  PaginatedResult,
  TrainerBookingView,
  UserBookingView,
} from "./booking.interface";
import { CreateBookingDto, CancelBookingDto } from "../dto/booking.dto";

export interface IBookingService {
  createBooking(userId: string, data: CreateBookingDto): Promise<void>;
  acceptBooking(trainerId: string, bookingId: string): Promise<void>;
  rejectBooking(trainerId: string, bookingId: string, data: CancelBookingDto): Promise<void>;
  cancelBooking(requesterId: string, role: Role, bookingId: string, data: CancelBookingDto): Promise<void>;
  getTrainerBookings(trainerId: string, filter: GetBookingsFilter): Promise<PaginatedResult<TrainerBookingView>>;
  getUserBookings(userId: string, filter: GetBookingsFilter): Promise<PaginatedResult<UserBookingView>>;
}
