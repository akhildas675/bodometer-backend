import { NextFunction, Request, Response } from "express";
import { AddWorkoutDto, AdminBlockUnblockTrainerDto, AdminBlockUnBlockUserDto, AdminGetTrainersDto, AdminGetUsersDto, CreateSubscriptionDTO, GetTrainerAppointmentsQueryDto, RejectTrainerBodyDto, UpdateSubscriptionDTO, UpdateWorkoutDto } from "@/dto/admin/admin.dto";
import { AppError } from "@/utils/appError";
import { IAdminService } from "@/interfaces/admin/admin-service.interface";
import { STATUS } from "@/constants/statuscode";
import { MESSAGES } from "@/constants/messages";
import { AuthRequest } from "@/middleware/authGuard";

export class AdminController {
  constructor(private _adminService: IAdminService) { }

  //workouts

  createWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Record<string, Express.Multer.File[]>;

      const workoutImageFile = files?.workoutImage?.[0];
      const coverPhotoFile = files?.coverPhoto?.[0];
      const introVideoFile = files?.introVideo?.[0];

      if (!workoutImageFile) {
        throw new AppError(STATUS.BAD_REQUEST, "Workout image is required");
      }

      const dto: AddWorkoutDto = {
        workoutName: req.body.workoutName,
        workoutDescription: req.body.workoutDescription,
        targetMuscles: req.body.targetMuscles,
        equipment: req.body.equipment,
        benefits: req.body.benefits,
        workoutImageFile,
      };

      if (coverPhotoFile) dto.coverPhotoFile = coverPhotoFile;
      if (introVideoFile) dto.introVideoFile = introVideoFile;

      const result = await this._adminService.createWorkout(dto);
      res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.WORKOUT.CREATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };



  toggleWorkoutStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }
      const result = await this._adminService.toggleWorkoutStatus(id);
      res.status(STATUS.OK).json({
        success: true,
        message: result.isActive
          ? MESSAGES.WORKOUT.ACTIVATED
          : MESSAGES.WORKOUT.DEACTIVATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };


  getWorkout = async (req: Request, res: Response, next: NextFunction) => {
    try {

      console.log("get workout fun work")
      const workouts = await this._adminService.fetchWorkouts();

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: workouts,
      });
    } catch (error) {
      next(error);
    }
  };


  getWorkoutById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    console.log("hit get workout by id")
    if (!id) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
    const result = await this._adminService.getWorkoutById(id);
     console.log("result before sending:", result);
    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.COMMON.SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

updateWorkout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);

    const files = req.files as Record<string, Express.Multer.File[]>;

    const dto: UpdateWorkoutDto = {
      workoutName: req.body.workoutName,
      workoutDescription: req.body.workoutDescription,
      targetMuscles: req.body.targetMuscles,
      equipment: req.body.equipment,
      benefits: req.body.benefits,
    };

    if (files?.workoutImage?.[0]) dto.workoutImageFile = files.workoutImage[0];
    if (files?.coverPhoto?.[0])   dto.coverPhotoFile   = files.coverPhoto[0];
    if (files?.introVideo?.[0])   dto.introVideoFile   = files.introVideo[0];

    const result = await this._adminService.updateWorkout(id, dto);

    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.COMMON.SUCCESS,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
  // subscription
  createSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: CreateSubscriptionDTO = req.body.data;
      const result = await this._adminService.createSubscription(data);
      return res.status(STATUS.CREATED).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.CREATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllSubscriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this._adminService.getAllSubscriptions();
      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.LIST_FETCHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getSubscriptionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ID_REQUIRED);
      }
      const result = await this._adminService.getSubscriptionById(id);
      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.FETCHED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ID_REQUIRED);
      }
      const data: UpdateSubscriptionDTO = req.body.data;
      const result = await this._adminService.updateSubscription(id, data);
      return res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.SUBSCRIPTION.UPDATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
  toggleSubscriptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.SUBSCRIPTION.ID_REQUIRED);
      }
      const result = await this._adminService.toggleSubscriptionStatus(id);
      return res.status(STATUS.OK).json({
        success: true,
        message: result.isActive ? MESSAGES.SUBSCRIPTION.ACTIVATED : MESSAGES.SUBSCRIPTION.DEACTIVATED,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };


  //Trainer

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const query = req.query as AdminGetTrainersDto
      const data = await this._adminService.fetchTrainers(query);
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

      await this._adminService.blockTrainer(trainerId);

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

      await this._adminService.unblockTrainer(trainerId);

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
    const query: GetTrainerAppointmentsQueryDto = {};

    if (req.query.search) query.search = req.query.search as string;
    if (req.query.sortBy) query.sortBy = req.query.sortBy as string;
    if (req.query.sortOrder) query.sortOrder = req.query.sortOrder as "asc" | "desc";
    if (req.query.page) query.page = Number(req.query.page);
    if (req.query.limit) query.limit = Number(req.query.limit);
    if (req.query.status) query.status = req.query.status as string;

    const result = await this._adminService.getTrainerAppointments(query);
    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  };
  getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params

    if (!profileId) {
      throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    }

    const trainer = await this._adminService.getTrainerByProfileId(profileId);

    console.log("Trainer Profile details", trainer)

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
    const { reason } = req.body as RejectTrainerBodyDto

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

  //User
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const data = await this._adminService.fetchUsers(query);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_FETCHED,
        data: data.data,
        pagination: data.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

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
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.unblockUser(userId);

      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.ADMIN.USER_UNBLOCKED,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllSections = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sections = await this._adminService.getAllSections();
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.COMMON.SUCCESS,
        data: sections,
      });
    } catch (error) {
      next(error);
    }
  };

  
}
