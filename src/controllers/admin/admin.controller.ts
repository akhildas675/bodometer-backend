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

export class AdminController {
  constructor(private _adminService: IAdminService) {}

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const users = await this._adminService.fetchUsers(query);
      console.log(users);
      res.status(200).json({
        success: true,
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

      res.status(200).json({
        success: true,
        message: "User blocked successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockDto;

      await this._adminService.unblockUser(userId);

      res.status(200).json({
        success: true,
        message: "User unblocked successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("function worked get all trainers");
    const query = req.query as unknown as AdminGetTrainersDto; 
    console.log("Trainers query params", query);
    const trainers = await this._adminService.fetchTrainers(query);
    console.log(trainers);
    res.status(200).json({
      success: true,
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

      res.status(200).json({
        success: true,
        message: "Trainer blocked successfully",
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

      res.status(200).json({
        success: true,
        message: "Trainer unblocked successfully",
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
        throw new AppError(400, "Missing fields");
      }

      if (!file) {
        throw new AppError(400, "File missing");
      }

      const body: AddWorkoutDto = { workoutName, workoutDescription, file };

      const result = await this._adminService.workoutAdd(body);

      res.status(201).json({
        success: true,
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

      res.status(200).json({
        success: true,
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

    res.status(200).json({
      success: true,
      message: "Trainer appointments fetched successfully",
      data: trainers,
    });
  };

  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(400, "Profile ID is required");
    }

    const trainer = await this._adminService.getTrainerByProfileId(profileId);

    res.status(200).json({
      success: true,
      message: "Trainer details fetched successfully",
      data: trainer,
    });
  };

  approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;

    if (!profileId) {
      throw new AppError(400, "Profile ID is required");
    }

    const result = await this._adminService.approveTrainer(profileId);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };

  rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;
    const { reason } = req.body;

    if (!profileId) {
      throw new AppError(400, "Profile ID is required");
    }

    if (!reason) {
      throw new AppError(400, "Rejection reason is required");
    }

    const result = await this._adminService.rejectTrainer(profileId, reason);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.profile,
    });
  };
}
