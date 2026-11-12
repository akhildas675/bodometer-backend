import { ClientSession } from "mongoose";
import { Booking, BookingStatus } from "../domain/booking.interface";

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
  findUserConflictingBookings(
    userId: string,
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
    data: Partial<Booking>,
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
  acquireSlotHold(input: {
    trainerId: string;
    serviceId: string;
    startTime: Date;
    endTime: Date;
    userId: string;
    holdToken: string;
    holdExpiresAt: Date;
  }): Promise<boolean>;
  attachBookingToSlot(
    trainerId: string,
    serviceId: string,
    startTime: Date,
    bookingId: string
  ): Promise<void>;
  confirmSlotHold(input: {
    trainerId: string;
    serviceId: string;
    startTime: Date;
    holdToken: string;
    bookingId: string;
  }): Promise<boolean>;
  releaseSlotHold(input: {
    trainerId: string;
    serviceId: string;
    startTime: Date;
    holdToken?: string;
    bookingId?: string;
  }): Promise<void>;
  findStalePendingPayments(cutoff: Date): Promise<Booking[]>;
  expirePendingBooking(id: string): Promise<Booking | null>;
  confirmPendingPayment(id: string, paymentId: string): Promise<Booking | null>;
}
