import { injectable } from "inversify";
import mongoose, { ClientSession } from "mongoose";
import { BookingRescheduleRequest } from "../interface/domain/booking-reschedule-request.interface";
import { BookingRescheduleRequestModel, IBookingRescheduleRequestDocument } from "../model/booking-reschedule-request.model";
import { BookingModel } from "../model/booking.model";

export interface IBookingRescheduleRequestRepository {
  createOne(request: Partial<BookingRescheduleRequest>): Promise<BookingRescheduleRequest>;
  findById(id: string): Promise<BookingRescheduleRequest | null>;
  findPendingByBookingId(bookingId: string): Promise<BookingRescheduleRequest | null>;
  findPendingByTrainerId(trainerId: string): Promise<BookingRescheduleRequest[]>;
  findPendingByUserId(userId: string): Promise<BookingRescheduleRequest[]>;
  updateStatus(
    id: string,
    status: BookingRescheduleRequest["status"],
    responseReason?: string,
    session?: ClientSession,
  ): Promise<BookingRescheduleRequest | null>;
}

@injectable()
export class BookingRescheduleRequestRepository implements IBookingRescheduleRequestRepository {
  private mapDoc(doc: IBookingRescheduleRequestDocument): BookingRescheduleRequest {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      requestedBy: doc.requestedBy,
      requestedByUserId: doc.requestedByUserId.toString(),
      oldStartTime: doc.oldStartTime,
      oldEndTime: doc.oldEndTime,
      proposedStartTime: doc.proposedStartTime,
      proposedEndTime: doc.proposedEndTime,
      proposedBufferEndTime: doc.proposedBufferEndTime,
      reason: doc.reason,
      status: doc.status,
      expiresAt: doc.expiresAt,
      respondedAt: doc.respondedAt,
      responseReason: doc.responseReason,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createOne(request: Partial<BookingRescheduleRequest>): Promise<BookingRescheduleRequest> {
    const doc = await BookingRescheduleRequestModel.create(request);
    return this.mapDoc(doc);
  }

  async findById(id: string): Promise<BookingRescheduleRequest | null> {
    const doc = await BookingRescheduleRequestModel.findById(id);
    return doc ? this.mapDoc(doc) : null;
  }

  async findPendingByBookingId(bookingId: string): Promise<BookingRescheduleRequest | null> {
    const doc = await BookingRescheduleRequestModel.findOne({ bookingId, status: "PENDING" });
    return doc ? this.mapDoc(doc) : null;
  }

  async findPendingByTrainerId(trainerId: string): Promise<BookingRescheduleRequest[]> {
    const docs = await BookingRescheduleRequestModel.find({ requestedByUserId: trainerId, status: "PENDING" });
    return docs.map((doc) => this.mapDoc(doc));
  }

  async findPendingByUserId(userId: string): Promise<BookingRescheduleRequest[]> {
    const userBookings = await BookingModel.find({ userId: new mongoose.Types.ObjectId(userId) }).select("_id");
    const bookingIds = userBookings.map((b) => b._id.toString());
    const docs = await BookingRescheduleRequestModel.find({
      bookingId: { $in: bookingIds },
      status: "PENDING",
    }).sort({ createdAt: -1 });
    return docs.map((doc) => this.mapDoc(doc));
  }

  async updateStatus(
    id: string,
    status: BookingRescheduleRequest["status"],
    responseReason?: string,
    session?: ClientSession,
  ): Promise<BookingRescheduleRequest | null> {
    const doc = await BookingRescheduleRequestModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          respondedAt: new Date(),
          ...(responseReason ? { responseReason } : {}),
        },
      },
      { new: true, runValidators: true, session },
    ).exec();
    return doc ? this.mapDoc(doc) : null;
  }
}
