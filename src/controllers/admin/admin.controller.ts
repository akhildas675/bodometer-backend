import { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/appError";
import { parsePaginationQuery } from "../../utils/query";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import {
  AdminBlockUnBlockUserDto,
  AdminGetUsersDto,
} from "../../dto/user/user.dto";
import {
  AdminBlockUnblockTrainerDto,
  AdminGetTrainersDto,
  GetTrainerAppointmentsQueryDto,
  RejectTrainerBodyDto,
} from "../../dto/trainer/trainer.dto";


import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";

import { MealCategoryDto, UpdateMealCategoryDto } from "@/dto/meal.category/meal-category.dto";

export class AdminController {
  constructor(private _adminService: IAdminService) {}

  //Trainer

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as AdminGetTrainersDto;
      const data = await this._adminService.fetchTrainers(query);
      new SuccessResponse(
        STATUS.OK,
        MESSAGES.TRAINER.TRAINERS_FETCHED,
        data.data,
        data.pagination,
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
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.blockTrainer(trainerId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.TRAINER_BLOCKED).send(res);
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
      const { trainerId } =
        req.params as unknown as AdminBlockUnblockTrainerDto;

      await this._adminService.unblockTrainer(trainerId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.TRAINER_UNBLOCKED).send(
        res,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  //trainer appointment

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

      const result = await this._adminService.getTrainerAppointments(query);
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

      const trainer = await this._adminService.getTrainerByProfileId(profileId);

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

      const result = await this._adminService.approveTrainer(profileId);

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

      const result = await this._adminService.rejectTrainer(profileId, reason);

      new SuccessResponse(STATUS.OK, result.message, result.profile).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  //User
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const data = await this._adminService.fetchUsers(query);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.USER.PROFILE_FETCHED,
        data.data,
        data.pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.blockUser(userId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.USER_BLOCKED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };

  unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;

      await this._adminService.unblockUser(userId);

      new SuccessResponse(STATUS.OK, MESSAGES.ADMIN.USER_UNBLOCKED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Unknown error occurred"));
      }
    }
  };



  createMealCategory = async(req:AuthRequest,res:Response,next:NextFunction)=>{
    try {
      const data = req.body as MealCategoryDto;

      await this._adminService.createMealCategory(data);
      new SuccessResponse(STATUS.CREATED,MESSAGES.MEAL_CATEGORY.CREATED).send(res)
      
    } catch (error:unknown) {
       if(error instanceof Error){

        next(error);
    }else{
      next(new Error("Failed to create Meal Category"))
    }
    }
  }

  getAllMealCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
        status: req.query.status as string,
      };
      const { data, pagination } = await this._adminService.getAllMealCategories(query);
      new SuccessResponse(
        STATUS.OK, 
        "Meal Categories fetched successfully", 
        data, 
        pagination
      ).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  getMealCategoryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._adminService.getMealCategoryById(id);
      new SuccessResponse(STATUS.OK, "Meal Category fetched successfully", result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateMealCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateMealCategoryDto;
      await this._adminService.updateMealCategory(id, data);
      new SuccessResponse(STATUS.OK, "Meal Category updated successfully").send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  toggleMealCategoryStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._adminService.toggleMealCategoryStatus(id);
      new SuccessResponse(STATUS.OK, result.message, result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
