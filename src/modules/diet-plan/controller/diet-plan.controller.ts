import { NextFunction, Response } from "express";
import { AuthRequest } from "../../../middleware/authGuard";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/statuscode";
import { MESSAGES } from "../../../constants/messages";
import { SuccessResponse } from "../../../utils/success.response";
import { inject, injectable } from "inversify";
import { DIET_PLAN_TYPES } from "../diet-plan.types";
import { IDietPlanService } from "../interface/diet-plan-service.interface";

@injectable()
export class DietPlanController {
  constructor(
    @inject(DIET_PLAN_TYPES.DietPlanService) private _dietPlanService: IDietPlanService
  ) {}

  generateDietPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._dietPlanService.generateDietPlan(req.user.id);

      new SuccessResponse(
        STATUS.CREATED,
        "Diet plan generated successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getDietPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const result = await this._dietPlanService.getDietPlans(req.user.id);

      new SuccessResponse(
        STATUS.OK,
        "Diet plans retrieved successfully",
        result
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
