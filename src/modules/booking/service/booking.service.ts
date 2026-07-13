import { inject, injectable } from "inversify";
import { BOOKING_TYPES } from "../booking.types";
import { IBookingRepository } from "../interface/booking-repository.interface";
import { ITrainerSlotRepository } from "../interface/trainer.slot-repository.interface";
import { IBookingService } from "../interface/booking-service.interface";
import { BookingValidation } from "../validation/booking.validation";
import { CreateBookingDto, CancelBookingDto } from "../dto/booking.dto";
import {
  GetBookingsFilter,
  PaginatedResult,
  TrainerBookingView,
  UserBookingView,
} from "../interface/booking.interface";
import {
  BOOKING_STATUS,
  SLOT_STATUS,
} from "@/constants/constant.values.ts/booking.constant";
import { ROLES, Role } from "@/constants/constant.values.ts/roles";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(BOOKING_TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,

    @inject(BOOKING_TYPES.TrainerSlotRepository)
    private _slotRepository: ITrainerSlotRepository,

    @inject(BOOKING_TYPES.BookingValidation)
    private _bookingValidation: BookingValidation
  ) {}



  async createBooking(userId: string, dto: CreateBookingDto): Promise<void> {
    await this._bookingValidation.validateCreateBooking(userId, dto);

    await this._bookingRepository.createBooking({
      userId,
      slotId: dto.slotId,
      status: BOOKING_STATUS.PENDING,
      note: dto.note,
    });

    await this._slotRepository.updateSlotStatus(dto.slotId, SLOT_STATUS.BOOKED);
  }


  async acceptBooking(trainerId: string, bookingId: string): Promise<void> {
    await this._bookingValidation.validateTrainerBookingAction(
      trainerId,
      bookingId
    );

    await this._bookingRepository.updateBookingById(bookingId, {
      status: BOOKING_STATUS.ACCEPTED,
    });
  }


  async rejectBooking(
    trainerId: string,
    bookingId: string,
    dto: CancelBookingDto
  ): Promise<void> {
    const { slotId } = await this._bookingValidation.validateTrainerBookingAction(
      trainerId,
      bookingId
    );

    await this._bookingRepository.updateBookingById(bookingId, {
      status: BOOKING_STATUS.REJECTED,
      cancelReason: dto.reason,
      cancelledBy: ROLES.TRAINER,
    });

    await this._slotRepository.updateSlotStatus(slotId, SLOT_STATUS.AVAILABLE);
  }



  async cancelBooking(
    requesterId: string,
    role: Role,
    bookingId: string,
    dto: CancelBookingDto
  ): Promise<void> {
    const { slotId } = await this._bookingValidation.validateCancelBooking(
      requesterId,
      role,
      bookingId
    );

    const status =
      role === ROLES.TRAINER
        ? BOOKING_STATUS.CANCELLED_BY_TRAINER
        : BOOKING_STATUS.CANCELLED_BY_USER;

    await this._bookingRepository.updateBookingById(bookingId, {
      status,
      cancelReason: dto.reason,
      cancelledBy: role,
    });

    await this._slotRepository.updateSlotStatus(slotId, SLOT_STATUS.AVAILABLE);
  }



  async getTrainerBookings(
    trainerId: string,
    filter: GetBookingsFilter
  ): Promise<PaginatedResult<TrainerBookingView>> {
    return this._bookingRepository.getTrainerBookings(trainerId, filter);
  }


  async getUserBookings(
    userId: string,
    filter: GetBookingsFilter
  ): Promise<PaginatedResult<UserBookingView>> {
    return this._bookingRepository.getUserBookings(userId, filter);
  }




}
