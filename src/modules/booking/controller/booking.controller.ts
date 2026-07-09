import { inject, injectable } from "inversify";
import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { BOOKING_TYPES } from "../booking.types";
import { IBookingService } from "../interface/booking-service.interface";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { CreateBookingDto, CancelBookingDto } from "../dto/booking.dto";

import { BookingStatus } from "@/constants/constant.values.ts/booking.constant";

@injectable()
export class BookingController {
  constructor(
    @inject(BOOKING_TYPES.BookingService)
    private _bookingService: IBookingService
  ) {}

  createBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const dto = req.body as CreateBookingDto;
      await this._bookingService.createBooking(userId, dto);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.BOOKING.BOOKING_CREATED
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

 

  acceptBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) throw new Error("Unauthorized");

      const { bookingId } = req.params;
      await this._bookingService.acceptBooking(trainerId, bookingId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.BOOKING.BOOKING_ACCEPTED
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };


  rejectBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) throw new Error("Unauthorized");

      const { bookingId } = req.params;
      const dto = req.body as CancelBookingDto;
      await this._bookingService.rejectBooking(trainerId, bookingId, dto);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.BOOKING.BOOKING_REJECTED
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };



  cancelBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const requesterId = req.user?.id;
      const role = req.user?.role;
      if (!requesterId || !role) throw new Error("Unauthorized");

      const { bookingId } = req.params;
      const dto = req.body as CancelBookingDto;

      await this._bookingService.cancelBooking(requesterId, role, bookingId, dto);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.BOOKING.BOOKING_CANCELLED
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };



  getTrainerBookings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) throw new Error("Unauthorized");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as BookingStatus | undefined;

      const result = await this._bookingService.getTrainerBookings(trainerId, {
        page,
        limit,
        status,
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.BOOKING.BOOKING_CREATED,
        result.data,
        result.pagination
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };


  getUserBookings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("Unauthorized");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as BookingStatus | undefined;

      const result = await this._bookingService.getUserBookings(userId, {
        page,
        limit,
        status,
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.BOOKING.BOOKING_CREATED,
        result.data,
        result.pagination
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };
}
