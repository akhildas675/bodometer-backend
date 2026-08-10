import { injectable } from "inversify";
import { BookingCancellation } from "../interface/domain/booking-cancellation.interface";
import { BookingCancellationModel } from "../model/booking-cancellation.model";

export interface IBookingCancellationRepository {
  createOne(cancellation: Partial<BookingCancellation>): Promise<BookingCancellation>;
  findByBookingId(bookingId: string): Promise<BookingCancellation | null>;
}

@injectable()
export class BookingCancellationRepository implements IBookingCancellationRepository {
  async createOne(cancellation: Partial<BookingCancellation>): Promise<BookingCancellation> {
    const doc = await BookingCancellationModel.create(cancellation);
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      cancelledBy: doc.cancelledBy,
      cancelledByUserId: doc.cancelledByUserId.toString(),
      reasonCode: doc.reasonCode,
      reason: doc.reason,
      cancelledAt: doc.cancelledAt,
      refundEligible: doc.refundEligible,
      refundPercentage: doc.refundPercentage,
      refundAmount: doc.refundAmount,
      policySnapshot: doc.policySnapshot,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByBookingId(bookingId: string): Promise<BookingCancellation | null> {
    const doc = await BookingCancellationModel.findOne({ bookingId });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      cancelledBy: doc.cancelledBy,
      cancelledByUserId: doc.cancelledByUserId.toString(),
      reasonCode: doc.reasonCode,
      reason: doc.reason,
      cancelledAt: doc.cancelledAt,
      refundEligible: doc.refundEligible,
      refundPercentage: doc.refundPercentage,
      refundAmount: doc.refundAmount,
      policySnapshot: doc.policySnapshot,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
