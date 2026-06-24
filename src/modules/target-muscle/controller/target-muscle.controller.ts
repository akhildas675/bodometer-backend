import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TARGET_MUSCLE_TYPES } from "../target-muscle.types";
import { ITargetMuscleService } from "../interface/target-muscle-service.interface";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/statuscode";
import {
  CreateTargetMuscleDto,
  TargetMuscleQueryDto,
  UpdateTargetMuscleDto,
} from "../dto/target-muscle.dto";

@injectable()
export class TargetMuscleController {
  constructor(
    @inject(TARGET_MUSCLE_TYPES.Service)
    private _targetMuscleService: ITargetMuscleService,
  ) {}

  createTargetMuscle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateTargetMuscleDto;
      dto.image = req.file;

      await this._targetMuscleService.createTargetMuscle(dto);

      new SuccessResponse(
        STATUS.CREATED,
        "Target muscle created successfully.",
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getAllTargetMuscles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as TargetMuscleQueryDto;
      const { data, pagination } = await this._targetMuscleService.getAllTargetMuscles(query);

      new SuccessResponse(
        STATUS.OK,
        "Target muscles fetched successfully.",
        data,
        pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getTargetMuscleById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetMuscleId = String(req.params.id);
      const data = await this._targetMuscleService.getTargetMuscleById(targetMuscleId);

      new SuccessResponse(
        STATUS.OK,
        "Target muscle fetched successfully.",
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  toggleTargetMuscleStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const targetMuscleId = String(req.params.id);
      const data = await this._targetMuscleService.toggleTargetMuscleStatus(targetMuscleId);

      new SuccessResponse(
        STATUS.OK,
        data.message,
        data,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  updateTargetMuscle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetMuscleId = String(req.params.id);
      const dto = req.body as UpdateTargetMuscleDto;
      dto.targetMuscleId = targetMuscleId;
      dto.image = req.file;

      await this._targetMuscleService.updateTargetMuscle(targetMuscleId, dto);

      new SuccessResponse(
        STATUS.OK,
        "Target muscle updated successfully.",
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };
}
