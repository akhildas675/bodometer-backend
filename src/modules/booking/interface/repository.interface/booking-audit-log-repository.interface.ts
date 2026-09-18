import { ClientSession } from "mongoose";
import { BookingAuditLog } from "../domain/booking-audit-log.interface";

export type CreateBookingAuditLogData = Omit<BookingAuditLog, "id" | "createdAt">;

export interface IBookingAuditLogRepository {
  createOne(data: CreateBookingAuditLogData, session?: ClientSession): Promise<BookingAuditLog>;
  findByBookingId(bookingId: string): Promise<BookingAuditLog[]>;
  updateById(
    id: string,
    data: Partial<BookingAuditLog>,
    session?: ClientSession
  ): Promise<BookingAuditLog | null>;
}
