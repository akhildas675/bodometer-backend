import { NextFunction, Request, Response } from "express";
import {
  AddWorkoutDto,
  AdminBlockUnBlockDto,
  AdminBlockUnblockTrainerDto,
  AdminGetTrainersDto,
  AdminGetUsersDto,
} from "../../dto/admin/admin.dto";
import { AppError } from "../../utils/appError";
import { WorkoutMapper } from "../../mappers/admin/admin.mappers";
import { IAdminService } from "../../interfaces/admin/admin-service.interface";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";

export class AdminController {
  constructor(private _adminService: IAdminService) {}

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as AdminGetUsersDto;
      const users = await this._adminService.fetchUsers(body);
      console.log(users);
      res.status(STATUS.OK).json({
        success: true,
        message:MESSAGES.USER.PROFILE_FETCHED,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockDto;

      console.log("This is the user id for backend....", userId);

      await this._adminService.blockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.USER_BLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockDto;

      await this._adminService.unblockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message:  MESSAGES.ADMIN.USER_UNBLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("function worked get all trianers");
      const body = req.body as AdminGetTrainersDto;
      console.log("Trainers id from body", body);
      const trainers = await this._adminService.fetchTrainers(body);
      console.log(trainers);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_FETCHED,
        data: trainers,
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

      await this._adminService.blockTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        message:  MESSAGES.ADMIN.TRAINER_BLOCKED,
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

      await this._adminService.unblockTrainer(trainerId);

      res.status(STATUS.OK).json({
        success: true,
        message:  MESSAGES.ADMIN.TRAINER_UNBLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  //workouts

  addWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { workoutName, workoutDescription } = req.body;
      const file = req.file;
      console.log("body data", req.file);

      if (!workoutName || !workoutDescription) {
        throw new AppError(STATUS.BAD_REQUEST,  MESSAGES.VALIDATION.REQUIRED_FIELD);
      }

      if (!file) {
        throw new AppError(STATUS.BAD_REQUEST,  MESSAGES.VALIDATION.REQUIRED_FIELD);
      }

      const body: AddWorkoutDto = { workoutName, workoutDescription, file };

      const result = await this._adminService.workoutAdd(body);

      res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.ADMIN.EXERCISE_CREATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workouts = await this._adminService.fetchWorkouts();
      console.log(workouts);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: WorkoutMapper.toResponseList(workouts),
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
    const trainers = await this._adminService.getTrainerAppointments();

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: trainers,
    });
  };

  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    }

    const trainer = await this._adminService.getTrainerByProfileId(profileId);

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

    const result = await this._adminService.approveTrainer(profileId);

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

    const result = await this._adminService.rejectTrainer(profileId, reason);

    res.status(STATUS.OK).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };
}

