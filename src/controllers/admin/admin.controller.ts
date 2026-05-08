import { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/appError";
import { IAdminService } from "../../interfaces/service-interface/admin/admin-service.interface";
import { STATUS } from "../../constants/statuscode";
import { MESSAGES } from "../../constants/messages";
import {
  AdminBlockUnblockTrainerDto,
  AdminBlockUnBlockUserDto,
  AdminGetTrainersDto,
  AdminGetUsersDto,
  CategoryQueryDto,
  CreateCategoryDto,
  GetTrainerAppointmentsQueryDto,
  RejectTrainerBodyDto,
  UpdateCategoryDto,
} from "../../dto/admin/admin.dto";
import { AuthRequest } from "@/middleware/authGuard";


export class AdminController {
  constructor(private _adminService: IAdminService) { }

  // ─── Trainer ────────────────────────────────────────────────────────────────

  getTrainers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as AdminGetTrainersDto;
      const data = await this._adminService.fetchTrainers(query);
      res.status(200).json({
        success: true,
        data: data.data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  blockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } = req.params as unknown as AdminBlockUnblockTrainerDto;
      await this._adminService.blockTrainer(trainerId);
      res.status(STATUS.OK).json({ success: true, message: MESSAGES.ADMIN.TRAINER_BLOCKED });
    } catch (error) {
      next(error);
    }
  };

  unblockTrainer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { trainerId } = req.params as unknown as AdminBlockUnblockTrainerDto;
      await this._adminService.unblockTrainer(trainerId);
      res.status(STATUS.OK).json({ success: true, message: MESSAGES.ADMIN.TRAINER_UNBLOCKED });
    } catch (error) {
      next(error);
    }
  };

  // ─── Trainer Appointments ───────────────────────────────────────────────────

  getTrainerAppointments = async (req: Request, res: Response, next: NextFunction) => {
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
    const { profileId } = req.params;
    if (!profileId) throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    const trainer = await this._adminService.getTrainerByProfileId(profileId);
    res.status(STATUS.OK).json({
      success: true,
      message: MESSAGES.TRAINER.PROFILE_FETCHED,
      data: trainer,
    });
  };

  approveTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;
    if (!profileId) throw new AppError(STATUS.BAD_REQUEST, "Profile ID is required");
    const result = await this._adminService.approveTrainer(profileId);
    res.status(STATUS.OK).json({ success: true, message: result.message, data: result.profile });
  };

  rejectTrainer = async (req: Request, res: Response, next: NextFunction) => {
    const { profileId } = req.params;
    const { reason } = req.body as RejectTrainerBodyDto;
    if (!profileId) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.INVALID_ID);
    if (!reason) throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.REQUIRED_FIELD);
    const result = await this._adminService.rejectTrainer(profileId, reason);
    res.status(STATUS.OK).json({ success: true, message: result.message, data: result.profile });
  };

  // ─── Users ──────────────────────────────────────────────────────────────────

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as unknown as AdminGetUsersDto;
      const data = await this._adminService.fetchUsers(query);
      res.status(STATUS.OK).json({
        success: true,
        message: MESSAGES.USER.PROFILE_FETCHED,
        data: data.data,
        pagination: data.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;
      await this._adminService.blockUser(userId);
      res.status(STATUS.OK).json({ success: true, message: MESSAGES.ADMIN.USER_BLOCKED });
    } catch (error) {
      next(error);
    }
  };

  unblockUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params as unknown as AdminBlockUnBlockUserDto;
      await this._adminService.unblockUser(userId);
      res.status(STATUS.OK).json({ success: true, message: MESSAGES.ADMIN.USER_UNBLOCKED });
    } catch (error) {
      next(error);
    }
  };

  // ─── Categories ─────────────────────────────────────────────────────────────

  createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data: CreateCategoryDto = {
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        image: req.file,
      };
      await this._adminService.createCategory(data);
      res.status(201).json({ success: true, message: MESSAGES.ADMIN.CATEGORY_CREATED });
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: UpdateCategoryDto = {
        categoryId: id,
        name: req.body.name?.trim(),
        description: req.body.description?.trim(),
        image: req.file,
      };
      await this._adminService.updateCategory(data);
      res.status(200).json({ success: true, message: MESSAGES.ADMIN.CATEGORY_UPDATED });
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const category = await this._adminService.getCategoryById(categoryId);
      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.CATEGORY_FETCHED,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query: CategoryQueryDto = {
        search: req.query.search as string | undefined,
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortOrder: req.query.sortOrder as "asc" | "desc" | undefined,
      };
      const { data, pagination } = await this._adminService.getAllCategories(query);
      res.status(200).json({
        success: true,
        message: MESSAGES.ADMIN.CATEGORIES_FETCHED,
        data,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  toggleCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._adminService.toggleCategoryStatus(id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.category,
      });
    } catch (error) {
      next(error);
    }
  };
}
