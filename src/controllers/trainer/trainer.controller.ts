import { NextFunction, Request, Response } from "express";
import { ITrainerService } from "../../interfaces/service-interface/trainer/trainer-service.interface";
import { AuthRequest } from "../../middleware/authGuard";
import { AppError } from "../../utils/appError";
import { STATUS } from "../../constants/statuscode";
import {
  TrainerProfileDto,
  UpdateTrainerProfileDto,
} from "../../dto/trainer/trainer.dto";
import { MESSAGES } from "../../constants/messages";

export class TrainerController {
  constructor(private _trainerService: ITrainerService) {}

  getTrainer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      const trainerId = req.user.id;
      const trainer = await this._trainerService.fetchTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        data: trainer,
      });
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
        throw new AppError(STATUS.UNAUTHORIZED, "User not authenticated");
      }

      const trainerId = req.user.id;

      const updateData: UpdateTrainerProfileDto = req.body;

      const updatedTrainer = await this._trainerService.updateTrainerProfile(
        trainerId,
        updateData,
      );

      res.status(STATUS.OK).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedTrainer,
      });
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
        throw new AppError(STATUS.UNAUTHORIZED, "Trainer not authenticated");
      }

      if (!req.file) {
        throw new AppError(STATUS.BAD_REQUEST, "No file uploaded");
      }

      const trainerId = req.user.id;
      const file = req.file;

      const profilePicUrl =
        await this._trainerService.uploadTrainerProfilePicture(trainerId, file);

      res.status(STATUS.OK).json({
        success: true,
        message: "Trainer Profile picture uploaded successfully",
        data: {
          url: profilePicUrl,
        },
      });
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

      const { dateOfBirth, gender, experience, bio, specializationIds } =
        req.body;
      const specsArray = Array.isArray(specializationIds)
        ? specializationIds
        : specializationIds
          ? [specializationIds]
          : [];

      const files = req.files as
        | Record<string, Express.Multer.File[]>
        | undefined;

      const profileImageFile = files?.profileImage?.[0];
      const certificateFile = files?.certificate?.[0];
      const coverImageFile = files?.coverImage?.[0];

      if (!profileImageFile) {
        throw new AppError(STATUS.BAD_REQUEST, "Profile image is required");
      }

      if (!certificateFile) {
        throw new AppError(STATUS.BAD_REQUEST, "Certificate is required");
      }

      if (!coverImageFile) {
        throw new AppError(STATUS.BAD_REQUEST, "Cover image is required");
      }

      const data: TrainerProfileDto = {
        profileImageFile,
        certificateFile,
        coverImageFile,
        dateOfBirth,
        gender,
        experienceInYears: Number(experience),
        bio,
        specializationIds: specsArray,
      };

      await this._trainerService.createProfile(req.user.id, data);

      return res.status(STATUS.CREATED).json({
        success: true,
        message: "Trainer profile created successfully",
      });
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
      return res.status(STATUS.OK).json({
        success: true,
        data: profileStatus,
      });
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
      const query: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      } = {};
      if (req.query.page) query.page = Number(req.query.page);
      if (req.query.limit) query.limit = Number(req.query.limit);
      if (req.query.search) query.search = String(req.query.search);
      if (req.query.sortBy) query.sortBy = String(req.query.sortBy);
      if (req.query.sortOrder)
        query.sortOrder = req.query.sortOrder as "asc" | "desc";

      const result = await this._trainerService.getCategories(query);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };
}
