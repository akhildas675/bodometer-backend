import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { FINANCE_TYPES } from "../finance.types";
import { IFinanceService } from "../interface/finance-service.interface";
import {
  ChartPeriod,
  TransactionQueryFilter,
} from "../interface/finance-query.interface";
import {
  TransactionStatus,
  TransactionType,
} from "../constant/finance.constant";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { AppError } from "@/utils/appError";

@injectable()
export class FinanceController {
  constructor(
    @inject(FINANCE_TYPES.FinanceService)
    private readonly _financeService: IFinanceService,
  ) {}

  getTrainerSummary = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const summary = await this._financeService.getTrainerFinanceSummary(
        trainerId,
      );
      new SuccessResponse(
        STATUS.OK,
        "Trainer finance summary retrieved successfully.",
        summary,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const filter: TransactionQueryFilter = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        transactionType: req.query.transactionType as TransactionType | undefined,
        status: req.query.status as TransactionStatus | undefined,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      };

      const result = await this._financeService.getTrainerTransactions(
        trainerId,
        filter,
      );
      new SuccessResponse(
        STATUS.OK,
        "Trainer transactions retrieved successfully.",
        result,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerChart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const period = (req.query.period as ChartPeriod) || "daily";
      const from = req.query.from
        ? new Date(req.query.from as string)
        : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;

      const chart = await this._financeService.getTrainerChart(
        trainerId,
        period,
        from,
        to,
      );
      new SuccessResponse(
        STATUS.OK,
        "Trainer chart data retrieved successfully.",
        chart,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getPlatformSummary = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summary = await this._financeService.getPlatformFinanceSummary();
      new SuccessResponse(
        STATUS.OK,
        "Platform finance summary retrieved successfully.",
        summary,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAllTransactions = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filter: TransactionQueryFilter = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        transactionType: req.query.transactionType as TransactionType | undefined,
        status: req.query.status as TransactionStatus | undefined,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      };

      const result = await this._financeService.getAllTransactions(filter);
      new SuccessResponse(
        STATUS.OK,
        "All transactions retrieved successfully.",
        result,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAdminChart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const period = (req.query.period as ChartPeriod) || "daily";
      const from = req.query.from
        ? new Date(req.query.from as string)
        : undefined;
      const to = req.query.to ? new Date(req.query.to as string) : undefined;

      const chart = await this._financeService.getAdminChart(
        period,
        from,
        to,
      );
      new SuccessResponse(
        STATUS.OK,
        "Admin chart data retrieved successfully.",
        chart,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
