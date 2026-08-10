import { ClientSession } from "mongoose";
import { BookingAuditLog } from "../domain/booking-audit-log.interface";
import { IBookingAuditLog } from "../../model/booking-audit-log.model";

export type CreateBookingAuditLogData = Omit<BookingAuditLog, "id" | "createdAt">;

export interface IBookingAuditLogRepository {
  createOne(data: CreateBookingAuditLogData, session?: ClientSession): Promise<BookingAuditLog>;
  findByBookingId(bookingId: string): Promise<BookingAuditLog[]>;
  updateById(
    id: string,
    data: Partial<IBookingAuditLog>,
    session?: ClientSession
  ): Promise<BookingAuditLog | null>;
}
