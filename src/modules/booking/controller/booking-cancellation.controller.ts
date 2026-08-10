import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { BOOKING_TYPES } from "../booking.types";
import { IBookingCancellationService } from "../interface/service.interface/booking-cancellation-service.interface";
import { CancelBookingDto } from "../dto/booking.dto";

@injectable()
export class BookingCancellationController {
  constructor(
    @inject(BOOKING_TYPES.BookingCancellationService)
    private _cancellationService: IBookingCancellationService,
  ) {}

  cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const role = req.user?.role;
      const { id } = req.params;
      const data = req.body as CancelBookingDto;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      if (role === "trainer") {
        const result = await this._cancellationService.cancelByTrainer({
          bookingId: id,
          trainerId: userId,
          reason: data.reason || MESSAGES.CANCELLATION.DEFAULT_TRAINER_REASON,
          reasonCode: data.reasonCode,
        });

        new SuccessResponse(
          STATUS.OK,
          MESSAGES.CANCELLATION.CANCELLED_BY_TRAINER_SUCCESS,
          result,
        ).send(res);
      } else {
        const result = await this._cancellationService.cancelByUser({
          bookingId: id,
          userId,
          reason: data.reason,
          reasonCode: data.reasonCode,
        });

        new SuccessResponse(
          STATUS.OK,
          MESSAGES.CANCELLATION.CANCELLED_BY_USER_SUCCESS,
          result,
        ).send(res);
      }
    } catch (error: unknown) {
      next(error);
    }
  };
}
