import { inject, injectable } from "inversify";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/middleware/authGuard";
import { FINANCE_TYPES } from "../finance.types";
import { IPayoutService } from "../interface/payout-service.interface";
import { PayoutQueryFilter } from "../interface/payout-query.interface";
import { PayoutStatus } from "../constant/finance.constant";
import { SuccessResponse } from "@/utils/success.response";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { AppError } from "@/utils/appError";
import {
  CompletePayoutDto,
  ProcessPayoutDto,
  RejectPayoutDto,
  RequestPayoutDto,
} from "../dto/payout.dto";
import { FinanceMapper } from "../mapper/finance.mapper";

@injectable()
export class PayoutController {
  constructor(
    @inject(FINANCE_TYPES.PayoutService)
    private readonly _payoutService: IPayoutService,
  ) {}

  requestPayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const { amount, bankDetails } = req.body as RequestPayoutDto;
      if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "A valid positive payout amount is required.",
        );
      }

      const payout = await this._payoutService.requestPayout(
        trainerId,
        amount,
        bankDetails,
      );
      new SuccessResponse(
        STATUS.CREATED,
        "Payout request submitted successfully.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerPayouts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const filter: PayoutQueryFilter = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as PayoutStatus | undefined,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      };

      const result = await this._payoutService.getTrainerPayouts(
        trainerId,
        filter,
      );
      new SuccessResponse(STATUS.OK, "Trainer payouts retrieved successfully.", {
        ...result,
        data: result.data.map((p) => FinanceMapper.toPayoutResponse(p)),
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerActivePayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const activePayout =
        await this._payoutService.getTrainerActivePayout(trainerId);
      new SuccessResponse(
        STATUS.OK,
        "Active payout request retrieved.",
        activePayout ? FinanceMapper.toPayoutResponse(activePayout) : null,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getTrainerAvailableBalance = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const trainerId = req.user?.id;
      if (!trainerId) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const availableBalance =
        await this._payoutService.getTrainerAvailableBalance(trainerId);
      new SuccessResponse(STATUS.OK, "Available balance retrieved.", {
        availableBalance,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  getPayoutDetails = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user;
      if (!user) {
        throw new AppError(STATUS.UNAUTHORIZED, "Authentication required.");
      }

      const payout = await this._payoutService.getPayoutById(id);

      // If trainer, ensure they only view their own payout
      if (user.role === "trainer" && payout.trainerId !== user.id) {
        throw new AppError(
          STATUS.FORBIDDEN,
          "You are not authorized to view this payout request.",
        );
      }

      new SuccessResponse(
        STATUS.OK,
        "Payout details retrieved successfully.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAllPayouts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const filter: PayoutQueryFilter = {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as PayoutStatus | undefined,
        from: req.query.from ? new Date(req.query.from as string) : undefined,
        to: req.query.to ? new Date(req.query.to as string) : undefined,
      };

      const result = await this._payoutService.getAllPayouts(filter);
      new SuccessResponse(
        STATUS.OK,
        "All payout requests retrieved successfully.",
        {
          ...result,
          data: result.data.map((p) => FinanceMapper.toPayoutResponse(p)),
        },
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  getAdminSummary = async (
    _req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summary = await this._payoutService.getAdminPayoutSummary();
      new SuccessResponse(
        STATUS.OK,
        "Admin payout summary retrieved successfully.",
        summary,
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  approvePayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const payout = await this._payoutService.approvePayout(id, adminId);
      new SuccessResponse(
        STATUS.OK,
        "Payout request approved successfully.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  rejectPayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const { reason } = req.body as RejectPayoutDto;
      if (typeof reason !== "string" || !reason.trim()) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Rejection reason is required.",
        );
      }

      const payout = await this._payoutService.rejectPayout(
        id,
        reason.trim(),
        adminId,
      );
      new SuccessResponse(
        STATUS.OK,
        "Payout request rejected successfully.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  processPayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const { providerPayoutId, adminNote } = req.body as ProcessPayoutDto;
      const payout = await this._payoutService.processPayout(
        id,
        { providerPayoutId, adminNote },
        adminId,
      );
      new SuccessResponse(
        STATUS.OK,
        "Payout marked as processing.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  completePayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const {
        bankTransferReference,
        transferredAt,
        adminNote,
        payoutMethod,
        providerPayoutId,
      } = req.body as CompletePayoutDto;

      const ref = bankTransferReference || providerPayoutId;
      if (!ref || !ref.trim()) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Bank transfer reference / UTR is required.",
        );
      }

      const payout = await this._payoutService.recordBankTransferAndComplete(
        id,
        {
          bankTransferReference: ref.trim(),
          transferredAt: transferredAt ? new Date(transferredAt) : new Date(),
          adminNote: adminNote?.trim(),
          payoutMethod,
          providerPayoutId: ref.trim(),
        },
        adminId,
      );
      new SuccessResponse(
        STATUS.OK,
        "Payout marked as paid and bank transfer recorded.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  failPayout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const { reason } = req.body as { reason?: unknown };
      if (typeof reason !== "string" || !reason.trim()) {
        throw new AppError(
          STATUS.BAD_REQUEST,
          "Failure reason is required.",
        );
      }

      const payout = await this._payoutService.failPayout(
        id,
        reason.trim(),
        adminId,
      );
      new SuccessResponse(
        STATUS.OK,
        "Payout marked as failed.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Admin approves and immediately pays the trainer via Stripe in one step.
   * Returns the payout record in PAID status with the Stripe payout ID.
   */
  approveAndPayViaStripe = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.id;
      const payout = await this._payoutService.approveAndPayViaStripe(id, adminId);
      new SuccessResponse(
        STATUS.OK,
        "Payout approved and paid via Stripe successfully.",
        FinanceMapper.toPayoutResponse(payout),
      ).send(res);
    } catch (error) {
      next(error);
    }
  };
}
