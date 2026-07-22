import { inject, injectable } from "inversify";
import { COACHING_TYPES } from "../coaching.types";
import { ICoachingService } from "../interface/coaching-service.interface";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { MESSAGES } from "@/constants/messages";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { SuccessResponse } from "@/utils/success.response";
import {
  CoachingQueryDto,
  CreateCoachingDto,
  UpdateCoachingDto,
} from "../dto/coaching.dto";
import { parsePaginationQuery } from "@/utils/query";
import { Role } from "@/constants/constant.values.ts/roles";

@injectable()
export class CoachingController {
  constructor(
    @inject(COACHING_TYPES.CoachingService)
    private _coachingService: ICoachingService,
  ) {}

  createCoaching = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = req.body as CreateCoachingDto;

      await this._coachingService.createCoaching(data);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.COACHING.COACHING_CREATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.COACHING.COACHING_CREATION_FAILED));
      }
    }
  };

  getCoaching = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = parsePaginationQuery(req) as CoachingQueryDto;
      const role = req.user?.role as Role;
      const { data, pagination } = await this._coachingService.getCoaching(
        query,
        role,
      );
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COACHING.COACHING_FETCHED,
        data,
        pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.COACHING.COACHING_FETCH_FAILED));
      }
    }
  };

  getCoachingServiceById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { serviceId } = req.params;

      const data =
        await this._coachingService.getCoachingServiceById(serviceId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COACHING.COACHING_FETCHED,
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.COACHING.COACHING_FETCH_FAILED));
      }
    }
  };

  updateCoachingService = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { serviceId } = req.params;
      const data = req.body as UpdateCoachingDto;

      await this._coachingService.updateCoachingService(serviceId, data);

      new SuccessResponse(STATUS.OK, MESSAGES.COACHING.COACHING_UPDATED).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.COACHING.COACHING_UPDATE_FAILED));
      }
    }
  };

  toggleCoachingStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { serviceId } = req.params;
      await this._coachingService.toggleCoachingStatus(serviceId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COACHING.COACHING_STATUS_TOGGLED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.COACHING.COACHING_STATUS_TOGGLE_FAILED));
      }
    }
  };
}
