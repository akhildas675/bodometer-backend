import { injectable } from "inversify";
import mongoose, { ClientSession } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import { IBookingAuditLog, BookingAuditLogModel } from "../model/booking-audit-log.model";
import {
  CreateBookingAuditLogData,
  IBookingAuditLogRepository,
} from "../interface/repository.interface/booking-audit-log-repository.interface";
import { BookingAuditAction, BookingAuditLog } from "../interface/domain/booking-audit-log.interface";

@injectable()
export class BookingAuditLogRepository
  extends BaseRepository<BookingAuditLog, IBookingAuditLog>
  implements IBookingAuditLogRepository
{
  constructor() {
    super(BookingAuditLogModel);
  }

  protected toInterface(doc: IBookingAuditLog): BookingAuditLog {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      action: doc.action as BookingAuditAction,
      performedBy: doc.performedBy.toString(),
      oldValue: doc.oldValue,
      newValue: doc.newValue,
      reason: doc.reason,
      createdAt: doc.createdAt,
    };
  }

  async createOne(data: CreateBookingAuditLogData, session?: ClientSession): Promise<BookingAuditLog> {
    const doc = new BookingAuditLogModel({
      bookingId: new mongoose.Types.ObjectId(data.bookingId),
      action: data.action,
      performedBy: new mongoose.Types.ObjectId(data.performedBy),
      oldValue: data.oldValue || {},
      newValue: data.newValue || {},
      reason: data.reason || "",
    });

    await doc.save({ session });
    return this.toInterface(doc);
  }

  async findByBookingId(bookingId: string): Promise<BookingAuditLog[]> {
    const docs = await BookingAuditLogModel.find({
      bookingId: new mongoose.Types.ObjectId(bookingId),
    })
      .sort({ createdAt: -1 })
      .exec();

    return docs.map((doc) => this.toInterface(doc));
  }

  async updateById(
    id: string,
    data: Partial<IBookingAuditLog>,
    session?: ClientSession,
  ): Promise<BookingAuditLog | null> {
    const doc = await BookingAuditLogModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true, session },
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }
}
