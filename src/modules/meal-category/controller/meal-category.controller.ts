import { NextFunction, Response } from "express";
import { inject, injectable } from "inversify";
import { AuthRequest } from "@/middleware/authGuard";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { MESSAGES } from "@/constants/messages";

import { MealCategoryDto, UpdateMealCategoryDto } from "../dto/meal-category.dto";
import { IMealCategoryService } from "../interface/meal-category-service.interface";
import { MEAL_CATEGORY_TYPES } from "../meal-category.types";

@injectable()
export class MealCategoryController {
  constructor(
    @inject(MEAL_CATEGORY_TYPES.IMealCategoryService) private _mealCategoryService: IMealCategoryService
  ) {}

  createMealCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = req.body as MealCategoryDto;

      await this._mealCategoryService.createMealCategory(data);
      new SuccessResponse(STATUS.CREATED, MESSAGES.MEAL_CATEGORY.CREATED).send(res);
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(error);
      } else {
        next(new Error("Failed to create Meal Category"));
      }
    }
  };

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
      const { data, pagination } = await this._mealCategoryService.getAllMealCategories(query);
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
      const result = await this._mealCategoryService.getMealCategoryById(id);
      new SuccessResponse(STATUS.OK, "Meal Category fetched successfully", result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  updateMealCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateMealCategoryDto;
      await this._mealCategoryService.updateMealCategory(id, data);
      new SuccessResponse(STATUS.OK, "Meal Category updated successfully").send(res);
    } catch (error: unknown) {
      next(error);
    }
  };

  toggleMealCategoryStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this._mealCategoryService.toggleMealCategoryStatus(id);
      new SuccessResponse(STATUS.OK, result.message, result).send(res);
    } catch (error: unknown) {
      next(error);
    }
  };
}
