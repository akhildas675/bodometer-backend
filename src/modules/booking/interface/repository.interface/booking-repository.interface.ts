import { ClientSession } from "mongoose";
import { Booking, BookingStatus } from "../domain/booking.interface";
import { IBooking } from "../../model/booking.model";

export type CreateBookingData = Omit<Booking, "id" | "createdAt" | "updatedAt">;

export interface IBookingRepository {
  createOne(data: CreateBookingData, session?: ClientSession): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findByBookingNumber(bookingNumber: string): Promise<Booking | null>;
  findByTrainerAndDate(trainerId: string, date: Date): Promise<Booking[]>;
  findConflictingBookings(
    trainerId: string,
    startTime: Date,
    bufferEndTime: Date,
    excludeBookingId?: string
  ): Promise<Booking[]>;
  findByUserId(userId: string): Promise<Booking[]>;
  findByTrainerId(trainerId: string): Promise<Booking[]>;
  updateStatus(
    id: string,
    status: BookingStatus,
    paymentId?: string,
    session?: ClientSession
  ): Promise<Booking | null>;
  updateById(
    id: string,
    data: Partial<IBooking>,
    session?: ClientSession
  ): Promise<Booking | null>;
  updateTimes(
    id: string,
    startTime: Date,
    endTime: Date,
    bufferEndTime: Date,
    bookingDate: Date,
    status?: BookingStatus,
    session?: ClientSession
  ): Promise<Booking | null>;
}
