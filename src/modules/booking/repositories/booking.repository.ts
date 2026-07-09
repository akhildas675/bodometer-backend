import { injectable } from "inversify";
import { Types } from "mongoose";
import { BaseRepository } from "@/modules/base/repository/base.repository";
import { IBooking, BookingModel } from "../models/booking.model";
import { TrainerSlotModel } from "../models/trainer-slot.model";
import { TrainerProfileModel } from "../../trainer/model/trainer-profile.model";
import { IBookingRepository } from "../interface/booking-repository.interface";
import {
  Booking,
  BookingTrainerInfo,
  BookingUserInfo,
  CreateBookingData,
  GetBookingsFilter,
  PaginatedResult,
  PaginationMeta,
  TrainerBookingView,
  UpdateBookingData,
  UserBookingView,
} from "../interface/booking.interface";

// ── Populated document types returned from Mongoose ──────────────────────────

interface PopulatedSlot {
  _id: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  trainerId: {
    _id: Types.ObjectId;
    name: string;
    profilePic?: string;
  };
}

interface UserBookingDocument {
  _id: Types.ObjectId;
  status: Booking["status"];
  cancelReason?: string;
  cancelledBy?: Booking["cancelledBy"];
  note?: string;
  createdAt: Date;
  slotId: PopulatedSlot;
}

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  profilePic?: string;
}

interface TrainerBookingDocument {
  _id: Types.ObjectId;
  status: Booking["status"];
  cancelReason?: string;
  cancelledBy?: Booking["cancelledBy"];
  note?: string;
  createdAt: Date;
  userId: PopulatedUser;
  slotId: {
    _id: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    trainerId: Types.ObjectId;
  };
}

// ── Helper: build standard pagination metadata ─────────────────────────────

function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

@injectable()
export default class BookingRepository
  extends BaseRepository<Booking, IBooking>
  implements IBookingRepository
{
  constructor() {
    super(BookingModel);
  }

  // ── toInterface: maps raw IBooking doc → Booking domain object ────────────

  protected toInterface(doc: IBooking): Booking {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      slotId: doc.slotId.toString(),
      status: doc.status,
      cancelReason: doc.cancelReason,
      cancelledBy: doc.cancelledBy,
      note: doc.note,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  // ── Create a new booking ──────────────────────────────────────────────────

  async createBooking(data: CreateBookingData): Promise<Booking> {
    return this.create(data);
  }

  // ── Find a booking by ID (raw, IDs only) ─────────────────────────────────

  async findBookingById(bookingId: string): Promise<Booking | null> {
    return this.findById(bookingId);
  }

  // ── Check if user already has a pending/accepted booking for a slot ───────
  //
  // Business rule: A user cannot book the same slot twice.
  // We check only PENDING status because once a slot is BOOKED, no one else
  // can book it anyway (slot.status guard in BookingValidation handles that).

  async findUserActiveBookingForSlot(
    userId: string,
    slotId: string
  ): Promise<Booking | null> {
    const doc = await this.model
      .findOne({
        userId: new Types.ObjectId(userId),
        slotId: new Types.ObjectId(slotId),
        status: "pending",
      })
      .exec();
    return doc ? this.toInterface(doc) : null;
  }

  // ── Update booking status (accept / reject / cancel) ─────────────────────

  async updateBookingById(
    bookingId: string,
    data: UpdateBookingData
  ): Promise<Booking | null> {
    const doc = await this.model
      .findByIdAndUpdate(
        bookingId,
        { $set: data },
        { new: true, runValidators: true }
      )
      .exec();
    return doc ? this.toInterface(doc) : null;
  }

  // ── Paginated list of bookings for a user ─────────────────────────────────
  //
  // Deep populate: slotId → trainerId (name, profilePic)
  // This flattens the nested structure into a UserBookingView.

  async getUserBookings(
    userId: string,
    filter: GetBookingsFilter
  ): Promise<PaginatedResult<UserBookingView>> {
    const { page = 1, limit = 10, status } = filter;
    const skip = (page - 1) * limit;

    const matchQuery: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };
    if (status) matchQuery.status = status;

    const [total, docs] = await Promise.all([
      this.model.countDocuments(matchQuery),
      this.model
        .find(matchQuery)
        .populate<{ slotId: PopulatedSlot }>({
          path: "slotId",
          populate: {
            path: "trainerId",
            select: "name profilePic",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const trainerIds = docs.map((doc) => doc.slotId.trainerId._id);
    const profiles = await TrainerProfileModel.find({ userId: { $in: trainerIds } }).select("_id userId").exec();
    const profileMap = new Map<string, string>(profiles.map((p: { userId: { toString(): string }; _id: { toString(): string } }) => [p.userId.toString(), p._id.toString()]));

    const data: UserBookingView[] = (
      docs as unknown as UserBookingDocument[]
    ).map((doc) => {
      const trainerInfo: BookingTrainerInfo = {
        id: doc.slotId.trainerId._id.toString(),
        name: doc.slotId.trainerId.name,
        profilePic: doc.slotId.trainerId.profilePic,
        profileId: profileMap.get(doc.slotId.trainerId._id.toString()),
      };
      return {
        id: doc._id.toString(),
        trainer: trainerInfo,
        startTime: doc.slotId.startTime,
        endTime: doc.slotId.endTime,
        status: doc.status,
        cancelReason: doc.cancelReason,
        cancelledBy: doc.cancelledBy,
        note: doc.note,
        createdAt: doc.createdAt,
      };
    });

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }

  // ── Paginated list of bookings for a trainer ──────────────────────────────
  //
  // Algorithm:
  //  1. Fetch all slotIds belonging to this trainer from TrainerSlot collection
  //  2. Query bookings where slotId is in that set
  //  3. Populate userId for user info
  //
  // WHY not a single aggregate? Keeping it simple and readable; the slot
  // ID pre-fetch is a single indexed query.

  async getTrainerBookings(
    trainerId: string,
    filter: GetBookingsFilter
  ): Promise<PaginatedResult<TrainerBookingView>> {
    const { page = 1, limit = 10, status } = filter;
    const skip = (page - 1) * limit;

    // Step 1: resolve all slotIds for this trainer
    const slots = await TrainerSlotModel.find({
      trainerId: new Types.ObjectId(trainerId),
    })
      .select("_id")
      .lean()
      .exec();

    const slotIds = slots.map((s: { _id: Types.ObjectId }) => s._id);

    const matchQuery: Record<string, unknown> = {
      slotId: { $in: slotIds },
    };
    if (status) matchQuery.status = status;

    const [total, docs] = await Promise.all([
      this.model.countDocuments(matchQuery),
      this.model
        .find(matchQuery)
        .populate<{ userId: PopulatedUser }>("userId", "name email profilePic")
        .populate("slotId", "startTime endTime")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
    ]);

    const data: TrainerBookingView[] = (
      docs as unknown as TrainerBookingDocument[]
    ).map((doc) => {
      const userInfo: BookingUserInfo = {
        id: doc.userId._id.toString(),
        name: doc.userId.name,
        email: doc.userId.email,
        profilePic: doc.userId.profilePic,
      };
      return {
        id: doc._id.toString(),
        user: userInfo,
        startTime: doc.slotId.startTime,
        endTime: doc.slotId.endTime,
        status: doc.status,
        cancelReason: doc.cancelReason,
        cancelledBy: doc.cancelledBy,
        note: doc.note,
        createdAt: doc.createdAt,
      };
    });

    return { data, pagination: buildPaginationMeta(total, page, limit) };
  }
}
