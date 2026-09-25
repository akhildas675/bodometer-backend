import { inject, injectable } from "inversify";
import { FINANCE_TYPES } from "../finance.types";
import { IPayoutRequestRepository } from "../interface/payout-repository.interface";
import { IFinancialTransactionRepository } from "../interface/finance-repository.interface";
import { IPayoutService } from "../interface/payout-service.interface";
import { PayoutRequest } from "../interface/payout-request.interface";
import {
  AdminPayoutSummary,
  PayoutQueryFilter,
} from "../interface/payout-query.interface";
import { PaginatedResult } from "@/modules/base/interface/common.interface";
import { PAYOUT_CONFIG, PAYOUT_STATUS } from "../constant/finance.constant";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";

@injectable()
export class PayoutService implements IPayoutService {
  constructor(
    @inject(FINANCE_TYPES.PayoutRequestRepository)
    private readonly _payoutRepository: IPayoutRequestRepository,

    @inject(FINANCE_TYPES.FinancialTransactionRepository)
    private readonly _transactionRepository: IFinancialTransactionRepository,
  ) {}

  async requestPayout(
    trainerId: string,
    amount: number,
  ): Promise<PayoutRequest> {
    if (amount < PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Minimum payout amount is ₹${PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT}.`,
      );
    }

    const normalizedAmount = Math.round(amount * 100) / 100;

    // 1. Guard against duplicate active payouts
    const activePayout =
      await this._payoutRepository.findActiveByTrainerId(trainerId);
    if (activePayout) {
      throw new AppError(
        STATUS.CONFLICT,
        "You already have an active payout request in progress.",
      );
    }

    // 2. Validate sufficient available balance
    const availableBalance = await this.getTrainerAvailableBalance(trainerId);
    if (normalizedAmount > availableBalance) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Insufficient available balance. Your available balance is ₹${availableBalance.toFixed(2)}.`,
      );
    }

    return this._payoutRepository.createOne({
      trainerId,
      amount: normalizedAmount,
      reservedAmount: normalizedAmount,
      currency: PAYOUT_CONFIG.DEFAULT_CURRENCY,
      status: PAYOUT_STATUS.PENDING,
      requestedAt: new Date(),
    });
  }

  async getTrainerPayouts(
    trainerId: string,
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>> {
    return this._payoutRepository.findByTrainerIdPaginated(trainerId, filter);
  }

  async getTrainerActivePayout(
    trainerId: string,
  ): Promise<PayoutRequest | null> {
    return this._payoutRepository.findActiveByTrainerId(trainerId);
  }

  async getTrainerAvailableBalance(trainerId: string): Promise<number> {
    const [earnings, payouts] = await Promise.all([
      this._transactionRepository.aggregateTrainerEarnings(trainerId),
      this._payoutRepository.getPayoutTotalsByTrainerId(trainerId),
    ]);

    const netEarnings =
      Math.round((earnings.totalEarned - earnings.totalRefunded) * 100) / 100;
    return Math.max(
      0,
      Math.round(
        (netEarnings - payouts.totalReserved - payouts.totalPaid) * 100,
      ) / 100,
    );
  }

  async getAllPayouts(
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>> {
    return this._payoutRepository.findAllPaginated(filter);
  }

  async approvePayout(payoutId: string): Promise<PayoutRequest> {
    const payout = await this._payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(STATUS.NOT_FOUND, "Payout request not found.");
    }

    if (payout.status !== PAYOUT_STATUS.PENDING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot approve payout with status '${payout.status}'. Only PENDING requests can be approved.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.APPROVED,
      approvedAt: new Date(),
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    return updated;
  }

  async rejectPayout(payoutId: string, reason: string): Promise<PayoutRequest> {
    const payout = await this._payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(STATUS.NOT_FOUND, "Payout request not found.");
    }

    if (payout.status !== PAYOUT_STATUS.PENDING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot reject payout with status '${payout.status}'. Only PENDING requests can be rejected.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.REJECTED,
      rejectionReason: reason,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    return updated;
  }

  async processPayout(
    payoutId: string,
    providerPayoutId?: string,
  ): Promise<PayoutRequest> {
    const payout = await this._payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(STATUS.NOT_FOUND, "Payout request not found.");
    }

    if (payout.status !== PAYOUT_STATUS.APPROVED) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot process payout with status '${payout.status}'. Only APPROVED requests can be processed.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.PROCESSING,
      processedAt: new Date(),
      providerPayoutId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    return updated;
  }

  async completePayout(
    payoutId: string,
    providerPayoutId?: string,
  ): Promise<PayoutRequest> {
    const payout = await this._payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(STATUS.NOT_FOUND, "Payout request not found.");
    }

    if (payout.status !== PAYOUT_STATUS.PROCESSING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot complete payout with status '${payout.status}'. Only PROCESSING requests can be completed.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.PAID,
      completedAt: new Date(),
      providerPayoutId: providerPayoutId ?? payout.providerPayoutId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    return updated;
  }

  async failPayout(payoutId: string, reason: string): Promise<PayoutRequest> {
    const payout = await this._payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(STATUS.NOT_FOUND, "Payout request not found.");
    }

    if (payout.status !== PAYOUT_STATUS.PROCESSING) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot fail payout with status '${payout.status}'. Only PROCESSING requests can be marked as failed.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.FAILED,
      failureReason: reason,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    return updated;
  }

  async getAdminPayoutSummary(): Promise<AdminPayoutSummary> {
    return this._payoutRepository.getAdminPayoutSummary();
  }
}
