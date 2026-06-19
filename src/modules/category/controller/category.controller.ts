import { MESSAGES } from "@/constants/messages";
import { STATUS } from "@/constants/statuscode";
import { ICategoryService } from "@/modules/category/interface/category-interface.service";
import { AuthRequest } from "@/middleware/authGuard";
import { AppError } from "@/utils/appError";
import { parsePaginationQuery } from "@/utils/query";
import { SuccessResponse } from "@/utils/success.response";
import { NextFunction, Response } from "express";
import {
  CategoryQueryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../dto/category.dto";
import { inject, injectable } from "inversify";
import { CATEGORY_TYPES } from "../category.types";
import { Role } from "@/constants/roles";

@injectable()
export class CategoryController {
  constructor(
    @inject(CATEGORY_TYPES.Service)
    private _categoryService: ICategoryService,
  ) {}

  createCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const data = req.body as CreateCategoryDto;

      await this._categoryService.createCategory(data);

      new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.CATEGORY.CATEGORY_CREATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.CATEGORY.CATEGORY_CREATION_FAILED));
      }
    }
  };

  updateCategory = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const {categoryId }= req.params;
    const data = { ...req.body, categoryId } as UpdateCategoryDto;

      await this._categoryService.updateCategory(data);
       new SuccessResponse(
        STATUS.CREATED,
        MESSAGES.CATEGORY.CATEGORY_UPDATED,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.CATEGORY.CATEGORY_UPDATE_FAILED));
      }
    }
  };

  getCategoryById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;
      if (!categoryId) {
        throw new AppError(STATUS.BAD_REQUEST, MESSAGES.VALIDATION.ID_REQUIRED);
      }

      const result = await this._categoryService.getCategoryById(categoryId);

      new SuccessResponse(STATUS.OK, MESSAGES.COMMON.SUCCESS, result).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.CATEGORY.CATEGORY_FETCH_FAILED));
      }
    }
  };

  getAllCategories = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const query = parsePaginationQuery(req) as CategoryQueryDto;
      const role = req.user?.role as Role;

      const { data, pagination } = await this._categoryService.getAllCategories(
        query,
        role,
      );

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.CATEGORY.CATEGORIES_FETCHED,
        data,
        pagination,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.CATEGORY.CATEGORY_FETCH_FAILED));
      }
    }
  };

  toggleCategoryStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { categoryId } = req.params;

      const result =
        await this._categoryService.toggleCategoryStatus(categoryId);

      new SuccessResponse(
        STATUS.OK,
        MESSAGES.CATEGORY.CATEGORY_STATUS_TOGGLED,
        result,
      ).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error(MESSAGES.CATEGORY.CATEGORY_UPDATE_FAILED));
      }
    }
  };
}
