import { NextFunction, Response } from "express";
import { ITrainerService } from "../../interfaces/service-interface/trainer/trainer-service.interface";
import { AuthRequest } from "../../middleware/authGuard";
import { parsePaginationQuery } from "../../utils/query";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import { Gender } from "../../constants/identity.constants";
import {
  TrainerProfileDto,
  UpdateTrainerProfileDto,
} from "../../dto/trainer/trainer.dto";
import { MESSAGES } from "../../constants/messages";
import { SuccessResponse } from "../../utils/success.response";

export class TrainerController {
  constructor(private _trainerService: ITrainerService) {}

  getTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      }

      const trainerId = req.user.id;
      const trainer = await this._trainerService.fetchTrainer(trainerId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.PROFILE_FETCHED,
        trainer
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      }

      const trainerId = req.user.id;

      const updateData = req.body as UpdateTrainerProfileDto;

      const updatedTrainer = await this._trainerService.updateTrainerProfile(
        trainerId,
        updateData,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.PROFILE_UPDATED,
        updatedTrainer
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  uploadProfilePicture = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.TOKEN.AUTHENTICATION_REQUIRED);
      }

      if (!req.file) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.FILE.FILE_REQUIRED);
      }

      const trainerId = req.user.id;
      const file = req.file;

      const profilePicUrl =
        await this._trainerService.uploadTrainerProfilePicture(trainerId, file);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_IMAGE_UPLOADED,
        { url: profilePicUrl }
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  //Trainer profile

  createProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }

      const body = req.body as {
        dateOfBirth?: string;
        gender?: Gender;
        experience?: number;
        bio?: string;
        specializationIds?: string | string[];
      };

      const files = req.files as
        | Record<string, Express.Multer.File[]>
        | undefined;

      const profileImageFile = files?.profileImage?.[0] as Express.Multer.File;
      const certificateFile = files?.certificate?.[0] as Express.Multer.File;
      const coverImageFile = files?.coverImage?.[0] as Express.Multer.File;

      const data: TrainerProfileDto = {
        profileImageFile,
        certificateFile,
        coverImageFile,
        dateOfBirth: body.dateOfBirth || "",
        gender: body.gender || "prefer_not_say",
        experienceInYears: body.experience || 0,
        bio: body.bio || "",
        specializationIds: Array.isArray(body.specializationIds)
          ? body.specializationIds
          : body.specializationIds
            ? [body.specializationIds]
            : [],
      };

      await this._trainerService.createProfile(req.user.id, data);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.TRAINER.PROFILE_CREATED
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getProfileStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.USER.USER_NOT_FOUND);
      }
      const userId = req.user.id;

      const profileStatus = await this._trainerService.getTrainerStatus(userId);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.STATUS_FETCHED,
        profileStatus
      ).send(res);
    } catch (err) {
      next(err);
    }
  };

  getCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req);

      const result = await this._trainerService.getCategories(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
