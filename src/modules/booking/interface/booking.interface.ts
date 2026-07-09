import { BookingStatus, SlotStatus } from "@/constants/constant.values.ts/booking.constant";
import { Role } from "@/constants/constant.values.ts/roles";

// ── Raw domain object (IDs only) ──────────────────────────────────────────────

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  status: BookingStatus;
  cancelReason?: string;
  cancelledBy?: Role;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingData {
  userId: string;
  slotId: string;
  status: BookingStatus;
  note?: string;
}

export interface UpdateBookingData {
  status?: BookingStatus;
  cancelReason?: string;
  cancelledBy?: Role;
  note?: string;
}

// ── Populated views returned to controllers ──────────────────────────────────

export interface BookingUserInfo {
  id: string;
  name: string;
  email: string;
  profilePic?: string;
}

export interface BookingTrainerInfo {
  id: string;
  name: string;
  profilePic?: string;
  profileId?: string;
}

export interface BookingSlotInfo {
  id: string;
  trainerId: string;
  startTime: Date;
  endTime: Date;
  status: SlotStatus;
}

/**
 * User perspective: booking with trainer info derived from the slot.
 */
export interface UserBookingView {
  id: string;
  trainer: BookingTrainerInfo;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  cancelReason?: string;
  cancelledBy?: Role;
  note?: string;
  createdAt: Date;
}

/**
 * Trainer perspective: booking with user info + slot time.
 */
export interface TrainerBookingView {
  id: string;
  user: BookingUserInfo;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  cancelReason?: string;
  cancelledBy?: Role;
  note?: string;
  createdAt: Date;
}

// ── Pagination ─────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface GetBookingsFilter {
  page?: number;
  limit?: number;
  status?: BookingStatus;
}
