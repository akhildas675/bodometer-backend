import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { EXERCISE_TYPES } from "../exercise.types";
import { IExerciseService } from "../interface/exercise-service.interface";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import {
    CreateExerciseDto,
    ExerciseQueryDto,
    UpdateExerciseDto,
} from "../dto/exercise.dto";

@injectable()
export class ExerciseController {
    constructor(
        @inject(EXERCISE_TYPES.Service)
        private _exerciseService: IExerciseService,
    ) {}

    createExercise = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const dto = req.body as CreateExerciseDto;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            dto.image = files?.["image"]?.[0];
            dto.video = files?.["video"]?.[0];

            await this._exerciseService.createExercise(dto);

            new SuccessResponse(STATUS.CREATED, "Exercise created successfully.").send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    getAllExercises = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query as unknown as ExerciseQueryDto;
            const { data, pagination } = await this._exerciseService.getAllExercises(query);

            new SuccessResponse(STATUS.OK, "Exercises fetched successfully.", data, pagination).send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    getExerciseById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const exerciseId = String(req.params.id);
            const data = await this._exerciseService.getExerciseById(exerciseId);

            new SuccessResponse(STATUS.OK, "Exercise fetched successfully.", data).send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    toggleExerciseStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const exerciseId = String(req.params.id);
            const data = await this._exerciseService.toggleExerciseStatus(exerciseId);

            new SuccessResponse(STATUS.OK, data.message, data).send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };

    updateExercise = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const exerciseId = String(req.params.id);
            const dto = req.body as UpdateExerciseDto;
            dto.exerciseId = exerciseId;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
            dto.image = files?.["image"]?.[0];
            dto.video = files?.["video"]?.[0];

            await this._exerciseService.updateExercise(exerciseId, dto);

            new SuccessResponse(STATUS.OK, "Exercise updated successfully.").send(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                next(error);
            } else {
                next(new Error("Unknown error occurred"));
            }
        }
    };
}
