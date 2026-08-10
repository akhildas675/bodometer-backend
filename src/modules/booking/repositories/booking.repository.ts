import { injectable } from "inversify";
import mongoose, { ClientSession } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import { IBooking, BookingModel } from "../model/booking.model";
import {
  CreateBookingData,
  IBookingRepository,
} from "../interface/repository.interface/booking-repository.interface";
import { Booking, BookingStatus } from "../interface/domain/booking.interface";

@injectable()
export class BookingRepository
  extends BaseRepository<Booking, IBooking>
  implements IBookingRepository
{
  constructor() {
    super(BookingModel);
  }

  protected toInterface(doc: IBooking): Booking {
    return {
      id: doc._id.toString(),
      bookingNumber: doc.bookingNumber,
      trainerId: doc.trainerId.toString(),
      userId: doc.userId.toString(),
      availabilityId: doc.availabilityId ? doc.availabilityId.toString() : undefined,
      serviceId: doc.serviceId.toString(),
      serviceSnapshot: doc.serviceSnapshot
        ? {
            name: doc.serviceSnapshot.name,
            durationMinutes: doc.serviceSnapshot.durationMinutes,
            bookingMode: doc.serviceSnapshot.bookingMode,
          }
        : undefined,
      pricing: doc.pricing
        ? {
            baseAmount: doc.pricing.baseAmount,
            discountAmount: doc.pricing.discountAmount,
            serviceFee: doc.pricing.serviceFee,
            totalAmount: doc.pricing.totalAmount,
            currency: doc.pricing.currency,
          }
        : undefined,
      bookingDate: doc.bookingDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      bufferEndTime: doc.bufferEndTime,
      status: doc.status as BookingStatus,
      paymentId: doc.paymentId,
      price: doc.price,
      attendance: {
        status: doc.attendance?.status || "PENDING",
        markedAt: doc.attendance?.markedAt,
        markedBy: doc.attendance?.markedBy?.toString(),
      },
      cancellation: doc.cancellation
        ? {
            cancelledBy: doc.cancellation.cancelledBy?.toString(),
            reason: doc.cancellation.reason,
            cancelledAt: doc.cancellation.cancelledAt,
          }
        : undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createOne(data: CreateBookingData, session?: ClientSession): Promise<Booking> {
    const doc = new BookingModel({
      bookingNumber: data.bookingNumber,
      trainerId: new mongoose.Types.ObjectId(data.trainerId),
      userId: new mongoose.Types.ObjectId(data.userId),
      availabilityId: data.availabilityId
        ? new mongoose.Types.ObjectId(data.availabilityId)
        : undefined,
      serviceId: new mongoose.Types.ObjectId(data.serviceId),
      serviceSnapshot: data.serviceSnapshot || {
        name: "Coaching Session",
        durationMinutes: 60,
        bookingMode: "ONLINE",
      },
      pricing: data.pricing || {
        baseAmount: data.price,
        discountAmount: 0,
        serviceFee: 0,
        totalAmount: data.price,
        currency: "inr",
      },
      bookingDate: data.bookingDate,
      startTime: data.startTime,
      endTime: data.endTime,
      bufferEndTime: data.bufferEndTime,
      status: data.status || "PENDING_PAYMENT",
      paymentId: data.paymentId || "",
      price: data.price,
      attendance: data.attendance || { status: "PENDING" },
      cancellation: data.cancellation,
    });

    await doc.save({ session });
    return this.toInterface(doc);
  }

  async findById(id: string): Promise<Booking | null> {
    const doc = await BookingModel.findById(id).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async findByBookingNumber(bookingNumber: string): Promise<Booking | null> {
    const doc = await BookingModel.findOne({ bookingNumber }).exec();
    return doc ? this.toInterface(doc) : null;
  }

  async findByTrainerAndDate(trainerId: string, date: Date): Promise<Booking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const docs = await BookingModel.find({
      trainerId: new mongoose.Types.ObjectId(trainerId),
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "CANCELLED" },
    }).exec();

    return docs.map((doc) => this.toInterface(doc));
  }

  async findConflictingBookings(
    trainerId: string,
    startTime: Date,
    bufferEndTime: Date,
    excludeBookingId?: string,
  ): Promise<Booking[]> {
    const filter: Record<string, unknown> = {
      trainerId: new mongoose.Types.ObjectId(trainerId),
      status: { $in: ["PENDING", "PENDING_PAYMENT", "CONFIRMED", "RESCHEDULE_PENDING"] },
      startTime: { $lt: bufferEndTime },
      bufferEndTime: { $gt: startTime },
    };

    if (excludeBookingId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(excludeBookingId) };
    }

    const docs = await BookingModel.find(filter).exec();
    return docs.map((doc) => this.toInterface(doc));
  }

  async findByUserId(userId: string): Promise<Booking[]> {
    const docs = await BookingModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ startTime: -1 })
      .exec();
    return docs.map((doc) => this.toInterface(doc));
  }

  async findByTrainerId(trainerId: string): Promise<Booking[]> {
    const docs = await BookingModel.find({
      trainerId: new mongoose.Types.ObjectId(trainerId),
    })
      .sort({ startTime: -1 })
      .exec();
    return docs.map((doc) => this.toInterface(doc));
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    paymentId?: string,
    session?: ClientSession,
  ): Promise<Booking | null> {
    const updatePayload: Record<string, unknown> = { status };
    if (paymentId) updatePayload.paymentId = paymentId;

    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true, session },
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }

  async updateById(
    id: string,
    data: Partial<IBooking>,
    session?: ClientSession,
  ): Promise<Booking | null> {
    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true, session },
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }

  async updateTimes(
    id: string,
    startTime: Date,
    endTime: Date,
    bufferEndTime: Date,
    bookingDate: Date,
    status?: BookingStatus,
    session?: ClientSession,
  ): Promise<Booking | null> {
    const updatePayload: Record<string, unknown> = {
      startTime,
      endTime,
      bufferEndTime,
      bookingDate,
    };
    if (status) updatePayload.status = status;

    const doc = await BookingModel.findByIdAndUpdate(
      id,
      { $set: updatePayload },
      { new: true, runValidators: true, session },
    ).exec();

    return doc ? this.toInterface(doc) : null;
  }
}
