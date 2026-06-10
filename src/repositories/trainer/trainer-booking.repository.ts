import { ITrainerBookingRepository } from "@/interfaces/repository-interface/trainer/trainer-booking.repository.interface";
import { BaseRepository } from "../base/base.repository";
import { PopulatedTrainerBooking, TrainerBooking } from "@/interfaces/domain.interface/trainer-booking.interface";
import { BookingStatus, ITrainerBookingDocument, TrainerBookingModel } from "@/models/trainer-booking.model";
import { PaginationMeta } from "@/interfaces/domain.interface/common.interface";
import { PipelineStage } from "mongoose";

export class TrainerBookingRepository extends BaseRepository<TrainerBooking, ITrainerBookingDocument> implements ITrainerBookingRepository {
  constructor() {
    super(TrainerBookingModel);
  }

  protected toInterface(doc: ITrainerBookingDocument): TrainerBooking {
    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      trainerId: doc.trainerId.toString(),
      bookingReference: doc.bookingReference,
      bookingType: doc.bookingType as "ONLINE" | "OFFLINE",
      bookingDate: doc.bookingDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
      userNotes: doc.userNotes,
      rejectionReason: doc.rejectionReason,
      cancellationReason: doc.cancellationReason,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      cancelledAt: doc.cancelledAt,
      completedAt: doc.completedAt,
      statusUpdatedAt: doc.statusUpdatedAt,
      createdAt: doc.createdAt,
    };
  }

  private async getPaginatedBookings(
    matchStage: Record<string, unknown>, 
    page: number, 
    limit: number,
    searchStage: PipelineStage | null,
    sortStage: Record<string, 1 | -1>
  ): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }> {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      { $unwind: "$userId" },
      {
        $lookup: {
          from: "users",
          localField: "trainerId",
          foreignField: "_id",
          as: "trainerId",
        }
      },
      { $unwind: "$trainerId" },
    ];

    if (searchStage) {
      pipeline.push(searchStage);
    }

    pipeline.push({ $sort: sortStage });

    const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" }];
    const countResult = await TrainerBookingModel.aggregate<{ total: number }>(countPipeline);
    const totalItems = countResult[0]?.total || 0;

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const results = await TrainerBookingModel.aggregate(pipeline);

    const data: PopulatedTrainerBooking[] = results.map(doc => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      trainerId: doc.trainerId,
      bookingReference: doc.bookingReference,
      bookingType: doc.bookingType as "ONLINE" | "OFFLINE",
      bookingDate: doc.bookingDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
      userNotes: doc.userNotes,
      rejectionReason: doc.rejectionReason,
      cancellationReason: doc.cancellationReason,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      cancelledAt: doc.cancelledAt,
      completedAt: doc.completedAt,
      statusUpdatedAt: doc.statusUpdatedAt,
      createdAt: doc.createdAt,
    }));

    return {
      data,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        totalItems,
        itemsPerPage: limitNum,
      },
    };
  }

  async findByUserIdPaginated(userId: string, page: number, limit: number, status?: BookingStatus, date?: Date, search?: string, sortBy: string = 'bookingDate', sortOrder: string = 'desc'): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }> {
    const mongoose = require('mongoose');
    const matchStage: Record<string, unknown> = { userId: new mongoose.Types.ObjectId(userId) };
    if (status) matchStage.status = status;
    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      matchStage.bookingDate = { $gte: date, $lt: nextDay };
    }
    
    let searchStage: PipelineStage | null = null;
    if (search) {
      searchStage = {
        $match: {
          "trainerId.name": { $regex: search, $options: 'i' }
        }
      } as PipelineStage;
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortStage: Record<string, 1 | -1> = { [sortBy]: sortDirection };
    if (sortBy !== 'startTime') sortStage['startTime'] = -1;

    return this.getPaginatedBookings(matchStage, page, limit, searchStage, sortStage);
  }

  async findByTrainerIdPaginated(trainerId: string, page: number, limit: number, status?: BookingStatus, date?: Date, search?: string, sortBy: string = 'bookingDate', sortOrder: string = 'desc'): Promise<{ data: PopulatedTrainerBooking[]; pagination: PaginationMeta }> {
    const mongoose = require('mongoose');
    const matchStage: Record<string, unknown> = { trainerId: new mongoose.Types.ObjectId(trainerId) };
    if (status) matchStage.status = status;
    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      matchStage.bookingDate = { $gte: date, $lt: nextDay };
    }
    
    let searchStage: PipelineStage | null = null;
    if (search) {
      searchStage = {
        $match: {
          "userId.name": { $regex: search, $options: 'i' }
        }
      } as PipelineStage;
    }

    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortStage: Record<string, 1 | -1> = { [sortBy]: sortDirection };
    if (sortBy !== 'startTime') sortStage['startTime'] = -1;

    return this.getPaginatedBookings(matchStage, page, limit, searchStage, sortStage);
  }



  async updateStatus(bookingId: string, updates: Partial<ITrainerBookingDocument>): Promise<PopulatedTrainerBooking | null> {
    const doc = await TrainerBookingModel.findByIdAndUpdate(
      bookingId,
      { $set: updates },
      { new: true }
    )
    .populate("userId", "name email profilePic")
    .populate("trainerId", "name email profilePic")
    .lean()
    .exec();

    if (!doc) return null;

    return {
      _id: doc._id.toString(),
      userId: doc.userId as any,
      trainerId: doc.trainerId as any,
      bookingReference: doc.bookingReference,
      bookingType: doc.bookingType as "ONLINE" | "OFFLINE",
      bookingDate: doc.bookingDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status as BookingStatus,
      userNotes: doc.userNotes,
      rejectionReason: doc.rejectionReason,
      cancellationReason: doc.cancellationReason,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      cancelledAt: doc.cancelledAt,
      completedAt: doc.completedAt,
      statusUpdatedAt: doc.statusUpdatedAt,
      createdAt: doc.createdAt,
    };
  }

  async findPopulatedById(bookingId: string): Promise<PopulatedTrainerBooking | null> {
    const doc = await TrainerBookingModel.findById(bookingId)
      .populate("userId", "name email profilePic")
      .populate("trainerId", "name email profilePic")
      .lean()
      .exec();

    if (!doc) return null;

    return {
      _id: doc._id.toString(),
      userId: doc.userId as any,
      trainerId: doc.trainerId as any,
      bookingReference: doc.bookingReference,
      bookingType: doc.bookingType as "ONLINE" | "OFFLINE",
      bookingDate: doc.bookingDate,
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status as BookingStatus,
      userNotes: doc.userNotes,
      rejectionReason: doc.rejectionReason,
      cancellationReason: doc.cancellationReason,
      approvedAt: doc.approvedAt,
      rejectedAt: doc.rejectedAt,
      cancelledAt: doc.cancelledAt,
      completedAt: doc.completedAt,
      statusUpdatedAt: doc.statusUpdatedAt,
      createdAt: doc.createdAt,
    };
  }

  async hasOverlappingBooking(trainerId: string, date: Date, startTime: string, endTime: string): Promise<boolean> {
    const query = {
      trainerId,
      bookingDate: date,
      status: { $in: ["pending", "approved"] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    };
    const count = await TrainerBookingModel.countDocuments(query);
    return count > 0;
  }

  async hasActiveBookingsBetweenDates(trainerId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const query = {
      trainerId,
      bookingDate: { $gte: startDate, $lte: endOfDay },
      status: { $in: ["pending", "approved"] }
    };
    const count = await TrainerBookingModel.countDocuments(query);
    return count > 0;
  }
}

export default TrainerBookingRepository;
