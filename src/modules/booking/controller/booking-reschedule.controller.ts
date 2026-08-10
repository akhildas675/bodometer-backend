import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AppError } from "@/utils/appError";
import { BOOKING_TYPES } from "../booking.types";
import { IBookingRescheduleService } from "../interface/service.interface/booking-reschedule-service.interface";
import { ProposeRescheduleDto, RespondRescheduleDto, WithdrawRescheduleDto } from "../dto/booking.dto";

@injectable()
export class BookingRescheduleController {
  constructor(
    @inject(BOOKING_TYPES.BookingRescheduleService)
    private _rescheduleService: IBookingRescheduleService,
  ) {}

  proposeRescheduleByTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const trainerId = req.user?.id;
      const { id } = req.params;
      const data = req.body as ProposeRescheduleDto;

      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const request = await this._rescheduleService.proposeByTrainer({
        bookingId: id,
        trainerId,
        proposedStartTime: data.proposedStartTime,
        proposedEndTime: data.proposedEndTime,
        proposedBufferEndTime: data.proposedBufferEndTime,
        reason: data.reason || MESSAGES.RESCHEDULE.DEFAULT_PROPOSE_REASON,
      });

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.RESCHEDULE.RESCHEDULE_PROPOSED,
        request,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  respondToRescheduleRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const { requestId } = req.params;
      const data = req.body as RespondRescheduleDto;

      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const result = await this._rescheduleService.respondToProposal({
        requestId,
        userId,
        accept: Boolean(data.accept),
        reason: data.reason,
      });

      new SuccessResponse(
        STATUS.OK,
        data.accept ? MESSAGES.RESCHEDULE.RESCHEDULE_ACCEPTED : MESSAGES.RESCHEDULE.RESCHEDULE_DECLINED,
        result,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  withdrawRescheduleProposal = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const trainerId = req.user?.id;
      const { requestId } = req.params;
      const data = req.body as WithdrawRescheduleDto;

      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const request = await this._rescheduleService.withdrawProposal({
        requestId,
        trainerId,
        reason: data.reason,
      });

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.RESCHEDULE.RESCHEDULE_WITHDRAWN,
        request,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getUserPendingRescheduleRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.COMMON.NOT_FOUND);
      }

      const requests = await this._rescheduleService.getPendingRequestsForUser(userId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.RESCHEDULE.RESCHEDULE_FETCHED,
        requests,
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
