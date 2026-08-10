import { injectable } from "inversify";
import { BookingRefund } from "../interface/domain/booking-refund.interface";
import { BookingRefundModel, IBookingRefundDocument } from "../model/booking-refund.model";

export interface IBookingRefundRepository {
  createOne(refund: Partial<BookingRefund>): Promise<BookingRefund>;
  findByBookingId(bookingId: string): Promise<BookingRefund | null>;
  updateStatus(id: string, status: BookingRefund["status"], gatewayRefundId?: string, failureReason?: string): Promise<BookingRefund | null>;
}

@injectable()
export class BookingRefundRepository implements IBookingRefundRepository {
  private mapDoc(doc: IBookingRefundDocument): BookingRefund {
    return {
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      paymentId: doc.paymentId,
      userId: doc.userId.toString(),
      trainerId: doc.trainerId.toString(),
      amount: doc.amount,
      currency: doc.currency,
      reason: doc.reason,
      triggeredBy: doc.triggeredBy,
      status: doc.status,
      gatewayRefundId: doc.gatewayRefundId,
      failureReason: doc.failureReason,
      processedBy: doc.processedBy,
      processedAt: doc.processedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createOne(refund: Partial<BookingRefund>): Promise<BookingRefund> {
    const doc = await BookingRefundModel.create(refund);
    return this.mapDoc(doc);
  }

  async findByBookingId(bookingId: string): Promise<BookingRefund | null> {
    const doc = await BookingRefundModel.findOne({ bookingId });
    return doc ? this.mapDoc(doc) : null;
  }

  async updateStatus(
    id: string,
    status: BookingRefund["status"],
    gatewayRefundId?: string,
    failureReason?: string,
  ): Promise<BookingRefund | null> {
    const doc = await BookingRefundModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          ...(gatewayRefundId ? { gatewayRefundId } : {}),
          ...(failureReason ? { failureReason } : {}),
          ...(status === "COMPLETED" ? { processedAt: new Date() } : {}),
        },
      },
      { new: true },
    );
    return doc ? this.mapDoc(doc) : null;
  }
}
