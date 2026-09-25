import { inject, injectable } from "inversify";
import { FINANCE_TYPES } from "../finance.types";
import { IFinancialTransactionRepository } from "../interface/finance-repository.interface";
import { IPayoutRequestRepository } from "../interface/payout-repository.interface";
import {
  CreateSessionEarningInput,
  IFinanceService,
  PlatformFinanceSummary,
  TrainerFinanceSummary,
} from "../interface/finance-service.interface";
import { FinancialTransaction } from "../interface/financial-transaction.interface";
import {
  AdminChartPoint,
  ChartPeriod,
  TrainerChartPoint,
  TransactionQueryFilter,
} from "../interface/finance-query.interface";
import { PaginatedResult } from "@/modules/base/interface/common.interface";
import {
  COMMISSION_DEFAULTS,
  PAYOUT_CONFIG,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from "../constant/finance.constant";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";

@injectable()
export class FinanceService implements IFinanceService {
  constructor(
    @inject(FINANCE_TYPES.FinancialTransactionRepository)
    private readonly _transactionRepository: IFinancialTransactionRepository,

    @inject(FINANCE_TYPES.PayoutRequestRepository)
    private readonly _payoutRepository: IPayoutRequestRepository,
  ) {}

  async createSessionEarning(
    input: CreateSessionEarningInput,
  ): Promise<FinancialTransaction> {
    if (input.grossAmount < 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Gross amount cannot be negative.",
      );
    }

    const referenceKey = `SESSION_EARNING:${input.bookingId}`;

    // 1. Idempotency pre-check
    const existing = await this._transactionRepository.findByReferenceKey(
      referenceKey,
    );
    if (existing) {
      return existing;
    }

    // 2. Calculate commission split with 2 decimal precision
    const trainerPercentage =
      input.trainerPercentage ?? COMMISSION_DEFAULTS.TRAINER_PERCENTAGE;
    const platformPercentage =
      input.platformPercentage ?? COMMISSION_DEFAULTS.PLATFORM_PERCENTAGE;

    const trainerAmount =
      Math.round(((input.grossAmount * trainerPercentage) / 100) * 100) / 100;
    const platformAmount =
      Math.round((input.grossAmount - trainerAmount) * 100) / 100;

    try {
      return await this._transactionRepository.createOne({
        bookingId: input.bookingId,
        paymentId: input.paymentId,
        userId: input.userId,
        trainerId: input.trainerId,
        grossAmount: input.grossAmount,
        trainerAmount,
        platformAmount,
        trainerPercentage,
        platformPercentage,
        currency: input.currency ?? PAYOUT_CONFIG.DEFAULT_CURRENCY,
        transactionType: TRANSACTION_TYPE.SESSION_EARNING,
        status: TRANSACTION_STATUS.COMPLETED,
        referenceKey,
        note: `Session earnings for booking ${input.bookingId}`,
        serviceName: input.serviceName,
      });
    } catch (error: unknown) {
      // In case of concurrent insert race condition, return existing transaction
      const mongoError = error as { code?: number };
      if (mongoError?.code === 11000) {
        const raceExisting =
          await this._transactionRepository.findByReferenceKey(referenceKey);
        if (raceExisting) {
          return raceExisting;
        }
      }
      throw error;
    }
  }

  async getTrainerFinanceSummary(
    trainerId: string,
  ): Promise<TrainerFinanceSummary> {
    const [earnings, payouts] = await Promise.all([
      this._transactionRepository.aggregateTrainerEarnings(trainerId),
      this._payoutRepository.getPayoutTotalsByTrainerId(trainerId),
    ]);

    const netEarnings =
      Math.round((earnings.totalEarned - earnings.totalRefunded) * 100) / 100;
    const availableBalance = Math.max(
      0,
      Math.round(
        (netEarnings - payouts.totalReserved - payouts.totalPaid) * 100,
      ) / 100,
    );

    return {
      totalEarned: earnings.totalEarned,
      totalRefunded: earnings.totalRefunded,
      netEarnings,
      availableBalance,
      totalPaidOut: payouts.totalPaid,
      pendingPayout: payouts.totalReserved,
    };
  }

  async getTrainerTransactions(
    trainerId: string,
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>> {
    return this._transactionRepository.findByTrainerIdPaginated(
      trainerId,
      filter,
    );
  }

  async getTrainerChart(
    trainerId: string,
    period: ChartPeriod,
    from?: Date,
    to?: Date,
  ): Promise<TrainerChartPoint[]> {
    const toDate = to ?? new Date();
    const fromDate =
      from ?? new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this._transactionRepository.aggregateTrainerChart(
      trainerId,
      period,
      fromDate,
      toDate,
    );
  }

  async getPlatformFinanceSummary(): Promise<PlatformFinanceSummary> {
    const [earnings, payouts] = await Promise.all([
      this._transactionRepository.aggregatePlatformEarnings(),
      this._payoutRepository.getAdminPayoutSummary(),
    ]);

    return {
      grossRevenue: earnings.grossRevenue,
      totalTrainerEarnings: earnings.totalTrainerEarnings,
      totalPlatformEarnings: earnings.totalPlatformEarnings,
      totalRefunded: earnings.totalRefunded,
      pendingPayouts: payouts.pendingAmount,
      completedPayouts: payouts.paidAmount,
    };
  }

  async getAllTransactions(
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>> {
    return this._transactionRepository.findAllPaginated(filter);
  }

  async getAdminChart(
    period: ChartPeriod,
    from?: Date,
    to?: Date,
  ): Promise<AdminChartPoint[]> {
    const toDate = to ?? new Date();
    const fromDate =
      from ?? new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    return this._transactionRepository.aggregateAdminChart(
      period,
      fromDate,
      toDate,
    );
  }
}
