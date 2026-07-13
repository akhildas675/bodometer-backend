import {
  Booking,
  CreateBookingData,
  GetBookingsFilter,
  PaginatedResult,
  TrainerBookingView,
  UpdateBookingData,
  UserBookingView,
} from "./booking.interface";

export interface IBookingRepository {
  createBooking(data: CreateBookingData): Promise<Booking>;
  findBookingById(bookingId: string): Promise<Booking | null>;
  findUserActiveBookingForSlot(userId: string, slotId: string): Promise<Booking | null>;
  updateBookingById(bookingId: string, data: UpdateBookingData): Promise<Booking | null>;
  getUserBookings(userId: string, filter: GetBookingsFilter): Promise<PaginatedResult<UserBookingView>>;
  getTrainerBookings(trainerId: string, filter: GetBookingsFilter): Promise<PaginatedResult<TrainerBookingView>>;

}
