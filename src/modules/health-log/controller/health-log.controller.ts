import { Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { HEALTH_LOG_TYPES } from "../health-log.types";
import { IHealthLogService } from "../interface/health-log-service.interface";
import { SuccessResponse } from "../../../utils/success.response";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/constant.values.ts/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { UpsertHealthLogDto } from "../dto/health-log.dto";
import { AuthRequest } from "../../../middleware/authGuard";
import { Timeframe } from "../../../constants/constant.values.ts/fitness.constant";

@injectable()
export class HealthLogController {
  constructor(
    @inject(HEALTH_LOG_TYPES.HealthLogService)
    private _healthLogService: IHealthLogService
  ) {}

  getHealthLog = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const date = (req.query.date as string) || new Date().toISOString();
      const result = await this._healthLogService.getHealthLog(req.user.id, date);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  upsertHealthLog = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const data = req.body as unknown as UpsertHealthLogDto;
      if (!data.date) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.DATE_REQUIRED);
      const result = await this._healthLogService.upsertHealthLog(req.user.id, data);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getHealthLogProgress = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      const timeframe = req.query.timeframe as Timeframe | undefined;
      const result = await this._healthLogService.getHealthLogProgress(req.user.id, timeframe);
      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };
}
