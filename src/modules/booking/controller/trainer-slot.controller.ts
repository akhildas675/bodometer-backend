import { inject, injectable } from "inversify";
import { Response, NextFunction } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { BOOKING_TYPES } from "../booking.types";
import { ITrainerSlotService } from "../interface/trainer.slot-service.interface";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";
import {  SlotStatus } from "@/constants/constant.values.ts/booking.constant";

@injectable()
export class TrainerSlotController {
  constructor(
    @inject(BOOKING_TYPES.TrainerSlotService)
    private _trainerSlotService: ITrainerSlotService
  ) {}



  getTrainerSlots = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) throw new Error("Unauthorized");

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = (req.query.sortBy as string) || "startTime";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "asc";
      const status = req.query.status as SlotStatus;
      const date = req.query.date as string;

      const result = await this._trainerSlotService.getTrainerSlotsPaginated(
        trainerId,
        {
          page,
          limit,
          sortBy,
          sortOrder,
          status,
          date,
        }
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.SLOT.SLOT_CREATED,
        result.data,
        result.pagination
      ).send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };




  getTrainerAvailableSlots = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { trainerId } = req.params;

      const slots =
        await this._trainerSlotService.getTrainerAvailableSlots(trainerId);

      new SuccessResponse(STATUS.OK, MESSAGES.SLOT.SLOT_CREATED, slots).send(
        res
      );
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  blockSlot = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      const { slotId } = req.params;
      if (!trainerId) throw new Error("Unauthorized");

      await this._trainerSlotService.blockSlot(trainerId, slotId);

      new SuccessResponse(STATUS.OK, "Slot blocked successfully.").send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };

  unblockSlot = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      const { slotId } = req.params;
      if (!trainerId) throw new Error("Unauthorized");

      await this._trainerSlotService.unblockSlot(trainerId, slotId);

      new SuccessResponse(STATUS.OK, "Slot unblocked successfully.").send(res);
    } catch (error: unknown) {
      next(error instanceof Error ? error : new Error(String(error)));
    }
  };
}
