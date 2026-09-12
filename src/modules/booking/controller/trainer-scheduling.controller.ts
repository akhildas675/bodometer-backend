import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";

import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";

import { BOOKING_TYPES } from "../booking.types";

import {
  CreateTrainerOverrideDto,
  CreateTrainerSchedulingSetupDto,
  SetupUnavailabilityDto,
  UpdateTrainerAvailabilityDto,
  UpdateTrainerBookingSettingsDto,
  UpdateTrainerOverrideDto,
} from "../dto/trainer-scheduling.dto";
import { ITrainerSchedulingService } from "../interface/service.interface/trainer-scheduling-service.interface";
import { IBookingService } from "../interface/service.interface/booking-service.interface";
import { CreateBookingDto, VerifyPaymentDto } from "../dto/booking.dto";

@injectable()
export class TrainerSchedulingController {
  constructor(
    @inject(BOOKING_TYPES.TrainerSchedulingService)
    private _trainerSchedulingService: ITrainerSchedulingService,

    @inject(BOOKING_TYPES.BookingService)
    private _bookingService: IBookingService,
  ) {}

  addUnavailability = (req: AuthRequest, res: Response, next: NextFunction) =>
    this.createUnavailability(req, res, next);

  addOverride = (req: AuthRequest, res: Response, next: NextFunction) =>
    this.createOverride(req, res, next);

  createSetup = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;

      if (!trainerId) {
        throw new AppError(
          STATUS.UNAUTHORIZED,
          MESSAGES.COMMON.NOT_FOUND,
        );
      }

      const data =
        req.body as CreateTrainerSchedulingSetupDto;


      await this._trainerSchedulingService.createSetup(
        trainerId,
        data,
      );

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.BOOKING.BOOKING_SETTINGS_CREATED,
      ).send(res);

    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(
          new Error(
            "Failed to create trainer booking setup",
          ),
        );
      }
    }
  };

  getSetup = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {

    try {

        const trainerId = req.user?.id;

        if (!trainerId) {
          throw new AppError(
            STATUS.UNAUTHORIZED,
            MESSAGES.COMMON.NOT_FOUND,
          );
        }


        const result =
            await this._trainerSchedulingService
                .getSetup(trainerId);

        new SuccessResponse(
            STATUS.OK,
            "Booking setup fetched successfully.",
            result,
        ).send(res);

    } catch (error) {

        next(error);
    }
};

  updateAvailability = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as UpdateTrainerAvailabilityDto;
      await this._trainerSchedulingService.updateAvailability(trainerId, data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.AVAILABILITY.AVAILABILITY_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateBookingSettings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as UpdateTrainerBookingSettingsDto;
      await this._trainerSchedulingService.updateBookingSettings(trainerId, data);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.BOOKING.BOOKING_SETTINGS_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  createUnavailability = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as SetupUnavailabilityDto;
      const leave = await this._trainerSchedulingService.createUnavailability(
        trainerId,
        data,
      );

      new SuccessResponse(
        STATUS.CREATED,
        "Unavailability added successfully.",
        leave,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getUnavailabilities = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const list = await this._trainerSchedulingService.getUnavailabilities(trainerId);

      new SuccessResponse(
        STATUS.OK,
        "Unavailabilities fetched successfully.",
        list,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateUnavailability = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      const unavailabilityId = req.params.id;
      if (!trainerId || !unavailabilityId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as Partial<SetupUnavailabilityDto>;
      const updated = await this._trainerSchedulingService.updateUnavailability(
        trainerId,
        unavailabilityId,
        data,
      );

      new SuccessResponse(
        STATUS.OK,
        "Unavailability updated successfully.",
        updated,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  deleteUnavailability = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      const unavailabilityId = req.params.id;
      if (!trainerId || !unavailabilityId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      await this._trainerSchedulingService.deleteUnavailability(
        trainerId,
        unavailabilityId,
      );

      new SuccessResponse(
        STATUS.OK,
        "Unavailability deleted successfully.",
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  createOverride = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as CreateTrainerOverrideDto;
      const override = await this._trainerSchedulingService.createOverride(
        trainerId,
        data,
      );

      new SuccessResponse(
        STATUS.CREATED,
        "Availability override created successfully.",
        override,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getOverrides = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const list = await this._trainerSchedulingService.getOverrides(trainerId);

      new SuccessResponse(
        STATUS.OK,
        "Availability overrides fetched successfully.",
        list,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateOverride = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      const overrideId = req.params.id;
      if (!trainerId || !overrideId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as UpdateTrainerOverrideDto;
      const updated = await this._trainerSchedulingService.updateOverride(
        trainerId,
        overrideId,
        data,
      );

      new SuccessResponse(
        STATUS.OK,
        "Availability override updated successfully.",
        updated,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  deleteOverride = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;
      const overrideId = req.params.id;
      if (!trainerId || !overrideId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      await this._trainerSchedulingService.deleteOverride(
        trainerId,
        overrideId,
      );

      new SuccessResponse(
        STATUS.OK,
        "Availability override deleted successfully.",
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  createBooking = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const data = req.body as CreateBookingDto;

      const result = await this._bookingService.createBooking({
        userId,
        trainerId: data.trainerId,
        serviceId: data.serviceId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        bufferEndTime: data.bufferEndTime,
        paymentMethod: data.paymentMethod,
      });

      new SuccessResponse(
        STATUS.CREATED,
        "Booking created successfully.",
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getBookingById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const bookingId = req.params.id;
      const booking = await this._bookingService.getBookingById(bookingId);
      if (!booking) {
        throw new AppError(STATUS.NOT_FOUND, MESSAGES.BOOKING.BOOKING_RECORD_NOT_FOUND);
      }
      new SuccessResponse(
        STATUS.OK,
        "Booking retrieved successfully.",
        booking,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  verifyBookingPayment = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = req.body as VerifyPaymentDto;

      if (!data.bookingId || !data.sessionId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "bookingId and sessionId are required.",
        );
      }

      const booking = await this._bookingService.verifyBookingPayment({
        bookingId: data.bookingId,
        sessionId: data.sessionId,
      });

      new SuccessResponse(
        STATUS.OK,
        "Booking payment verified and confirmed.",
        booking,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getUserBookings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const bookings = await this._bookingService.getUserBookings(userId);

      new SuccessResponse(
        STATUS.OK,
        "User bookings retrieved successfully.",
        bookings,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getTrainerBookings = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const trainerId = req.user?.id;

      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const bookings = await this._bookingService.getTrainerBookings(trainerId);

      new SuccessResponse(
        STATUS.OK,
        "Trainer bookings retrieved successfully.",
        bookings,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}