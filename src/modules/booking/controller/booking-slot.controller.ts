import { inject, injectable } from "inversify";
import { NextFunction, Request, Response } from "express";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { BOOKING_TYPES } from "../booking.types";
import { GetAvailableDatesParams, GetAvailableSlotsParams, IBookingSlotEngineService } from "../interface/service.interface/booking-slot-engine-service.interface";

@injectable()
export class BookingSlotController {
  constructor(
    @inject(BOOKING_TYPES.BookingSlotEngineService)
    private _slotEngineService: IBookingSlotEngineService,
  ) {}

  getAvailableSlots = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId, serviceId, date } = req.query as unknown as GetAvailableSlotsParams;

      if (!trainerId || !serviceId || !date) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SLOT.REQUIRED_DATES_PARAMS);
      }

      const slots = await this._slotEngineService.calculateAvailableSlots({
        trainerId: String(trainerId),
        serviceId: String(serviceId),
        date: String(date),
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SLOT.SLOTS_CALCULATED,
        slots,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getAvailableDates = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId, serviceId, month } = req.query as unknown as GetAvailableDatesParams;

      if (!trainerId || !serviceId || !month) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SLOT.REQUIRED_DATES_PARAMS);
      }

      const dates = await this._slotEngineService.calculateAvailableDatesOverview({
        trainerId: String(trainerId),
        serviceId: String(serviceId),
        month: String(month),
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SLOT.DATES_OVERVIEW_FETCHED,
        dates,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
