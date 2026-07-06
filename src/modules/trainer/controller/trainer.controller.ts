import { NextFunction, Response, Request } from "express";
import { ITrainerService } from '@/modules/trainer/interface/trainer-service.interface';
import { AuthRequest } from "../../../middleware/authGuard";
import { parsePaginationQuery } from "../../../utils/query";
import { AppError } from "../../../utils/appError";
import { STATUS } from "../../../constants/statuscode";
import { Gender } from "../../../constants/identity.constants";
import {
  TrainerProfileDto,
  UpdateTrainerProfileDto,
  GetAllTrainersDto,
  BlockUnblockTrainerDto,
  RejectTrainerBodyDto,
  GetTrainerAppointmentsQueryDto
} from "../dto/trainer.dto";
import { MESSAGES } from "../../../constants/messages";
import { SuccessResponse } from "../../../utils/success.response";
import { inject, injectable } from "inversify";
import { TRAINER_TYPES } from "../trainer.types";

@injectable()
export class TrainerController {
  constructor(
    @inject(TRAINER_TYPES.TrainerService)
    private _trainerService: ITrainerService
  ) {}

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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  getTrainers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: GetAllTrainersDto = {
        ...parsePaginationQuery(req)
      };

      const result = await this._trainerService.fetchTrainers(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.COMMON.SUCCESS,
        result.data,
        result.pagination
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } = req.params as unknown as BlockUnblockTrainerDto;
      await this._trainerService.blockTrainer(trainerId);
      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.USER_BLOCKED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } = req.params as unknown as BlockUnblockTrainerDto;
      await this._trainerService.unblockTrainer(trainerId);
      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.USER_UNBLOCKED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  uploadDocument = async (
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

      const file = req.file;
      const documentUrl = await this._trainerService.uploadTrainerDocument(file);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.FILE.UPLOAD_SUCCESS,
        { url: documentUrl }
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

   getTrainerAppointments = async (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      try {
        const query: GetTrainerAppointmentsQueryDto = {
          ...parsePaginationQuery(req),
          ...(req.query.status && { status: req.query.status as string }),
        };
  
        const result = await this._trainerService.getTrainerAppointments(query);
        new SuccessResponse(
          STATUS.OK,
          MESSAGES.TRAINER.PROFILE_FETCHED,
          result.data,
          result.pagination,
        ).send(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error("Unknown error occurred"));
        }
      }
    };



  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { profileId } = req.params;

      if (!profileId) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          MESSAGES.ADMIN.PROFILE_ID_REQUIRED,
        );
      }

      const trainer = await this._trainerService.getTrainerByProfileId(profileId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.PROFILE_FETCHED,
        trainer,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };
 


    approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { profileId } = req.params;
  
        if (!profileId) {
          throw new AppError(
            STATUS.BAD_REQUEST,
            MESSAGES.ADMIN.PROFILE_ID_REQUIRED,
          );
        }
  
        const result = await this._trainerService.approveTrainer(profileId);
  
        new SuccessResponse(STATUS.OK, result.message, result.profile).send(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error("Unknown error occurred"));
        }
      }
    };
  
    rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { profileId } = req.params;
        const { reason } = req.body as unknown as RejectTrainerBodyDto;
  
        if (!profileId) {
          throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.INVALID_ID);
        }
  
        if (!reason) {
          throw new AppError(
            STATUS.BAD_REQUEST,
            MESSAGES.VALIDATION.REQUIRED_FIELD,
          );
        }
  
        const result = await this._trainerService.rejectTrainer(profileId, reason);
  
        new SuccessResponse(STATUS.OK, result.message, result.profile).send(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error("Unknown error occurred"));
        }
      }
    };
  


}
