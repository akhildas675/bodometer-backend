import {Request,Response, NextFunction } from "express";
import { IAdminTrainerService } from "../../interfaces/admin/admin.trainer-service.interface";
import { AdminBlockUnblockTrainerDto } from "../../dto/admin/admin.dto";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import { AppError } from "../../utils/appError";

export class AdminTrainerController{
    constructor(private _adminTrainerService:IAdminTrainerService) {
    }

    getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {

      console.log("Trainers from body", req.query);
      const data = await this._adminTrainerService.fetchTrainers(req.query);
      console.log("Get trainers...", data);
      res.status(200).json({
        success: true,
        data: data.data,
        pagination: data.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      console.log("This is the trainer id for backend....", trainerId);

      await this._adminTrainerService.blockTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.TRAINER_BLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      console.log("This is the trainer id for backend....", trainerId);

      await this._adminTrainerService.unblockTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.TRAINER_UNBLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };


  
  //trainer appointment

  getTrainerAppointments = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    const {
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      status,
    } = req.query;

    const result = await this._adminTrainerService.getTrainerAppointments(
      search as string | undefined,
      sortBy as string | undefined,
      (sortOrder as 'asc' | 'desc') || 'asc',
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
      status as string | undefined
    );

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  };
  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    }

    const trainer = await this._adminTrainerService.getTrainerByProfileId(profileId);

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: trainer,
    });
  };

  approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    }

    const result = await this._adminTrainerService.approveTrainer(profileId);

    res.status(STATUS.OK).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };

  rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;
    const { reason } = req.body;

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.INVALID_ID);
    }

    if (!reason) {
      throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
    }

    const result = await this._adminTrainerService.rejectTrainer(profileId, reason);

    res.status(STATUS.OK).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };

    
}