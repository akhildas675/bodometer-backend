import { injectable } from "inversify";
import { Types } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import { ITrainerSlot, TrainerSlotModel } from "../models/trainer-slot.model";
import { ITrainerSlotRepository } from "../interface/trainer.slot-repository.interface";
import { CreateSlot, GetSlotsFilter, GetSlotsQuery, TrainerSlot } from "../interface/trainer-slot.interface";
import { PaginatedResult } from "../interface/booking.interface";
import { BookingModel } from "../models/booking.model";
import { SlotStatus } from "@/constants/constant.values.ts/booking.constant";


@injectable()
export default class TrainerSlotRepository
  extends BaseRepository<TrainerSlot, ITrainerSlot>
  implements ITrainerSlotRepository
{
  constructor() {
    super(TrainerSlotModel);
  }

  protected toInterface(doc: ITrainerSlot): TrainerSlot {
    return {
      id: doc._id.toString(),
      availabilityId: doc.availabilityId.toString(),
      trainerId: doc.trainerId.toString(),
      startTime: doc.startTime,
      endTime: doc.endTime,
      status: doc.status,
    };
  }

  // ── Single slot insert (legacy/testing) ─────────────────────────────────────

  async generateTrainerSlot(data: CreateSlot): Promise<TrainerSlot> {
    return this.create(data);
  }

  // ── Bulk slot insert (used by generateTrainerSlot service method) ────────────
  //
  // Algorithm: Use MongoDB insertMany for performance — avoids N round-trips.
  // Does not return results; caller only needs confirmation that slots were saved.

  async insertManySlots(slots: CreateSlot[]): Promise<void> {
    await this.model.insertMany(slots);
  }

  // ── Lookup by ID ─────────────────────────────────────────────────────────────

  async findSlotById(slotId: string): Promise<TrainerSlot | null> {
    return this.findById(slotId);
  }

  // ── Trainer's own slots (with optional filters) ───────────────────────────────
  //
  // Filter logic:
  //  - status: match exact status (e.g. "available")
  //  - from/to: startTime range filter (UTC date range)

  async findSlotsByTrainerId(
    trainerId: string,
    filter?: GetSlotsFilter
  ): Promise<TrainerSlot[]> {
    const query: Record<string, unknown> = {
      trainerId: new Types.ObjectId(trainerId),
    };

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.from || filter?.to) {
      const startTimeFilter: Record<string, Date> = {};
      if (filter.from) startTimeFilter.$gte = filter.from;
      if (filter.to) startTimeFilter.$lte = filter.to;
      query.startTime = startTimeFilter;
    }

    const docs = await this.model.find(query).sort({ startTime: 1 }).exec();
    const slotIds = docs.map((d) => d._id);
    const counts = await BookingModel.aggregate([
      { $match: { slotId: { $in: slotIds }, status: "pending" } },
      { $group: { _id: "$slotId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map<string, number>(counts.map((c: { _id: { toString(): string }; count: number }) => [c._id.toString(), c.count]));

    return docs.map((doc) => {
      const item = this.toInterface(doc);
      item.pendingBookingsCount = countMap.get(doc._id.toString()) || 0;
      return item;
    });
  }

  async findSlotsByTrainerIdPaginated(
    trainerId: string,
    filter: GetSlotsQuery
  ): Promise<PaginatedResult<TrainerSlot>> {
    const { page = 1, limit = 10, sortBy = "startTime", sortOrder = "asc", status, date } = filter;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      trainerId: new Types.ObjectId(trainerId),
    };

    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const sortDir = sortOrder === "desc" ? -1 : 1;
    const sortField = sortBy === "id" ? "_id" : sortBy;

    const [total, docs] = await Promise.all([
      this.model.countDocuments(query),
      this.model
        .find(query)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const slotIds = docs.map((d) => d._id);
    const counts = await BookingModel.aggregate([
      { $match: { slotId: { $in: slotIds }, status: "pending" } },
      { $group: { _id: "$slotId", count: { $sum: 1 } } }
    ]);
    const countMap = new Map<string, number>(counts.map((c: { _id: { toString(): string }; count: number }) => [c._id.toString(), c.count]));

    const data = docs.map((doc) => {
      const item = this.toInterface(doc);
      item.pendingBookingsCount = countMap.get(doc._id.toString()) || 0;
      return item;
    });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      data,
      pagination,
    };
  }

  // ── Bulk lookup by IDs (used to find trainer's slots from bookings) ──────────

  async findSlotsByIds(slotIds: string[]): Promise<TrainerSlot[]> {
    const objectIds = slotIds.map((id) => new Types.ObjectId(id));
    const docs = await this.model.find({ _id: { $in: objectIds } }).exec();
    return docs.map((doc) => this.toInterface(doc));
  }

  // ── Status update (called on booking accept/reject/cancel) ───────────────────
  //
  // WHY: The slot status is the source of truth for availability.
  // Resetting to AVAILABLE on reject/cancel allows re-booking.

  async updateSlotStatus(slotId: string, status: SlotStatus): Promise<void> {
    await this.model
      .findByIdAndUpdate(slotId, { status }, { runValidators: true })
      .exec();
  }
}
