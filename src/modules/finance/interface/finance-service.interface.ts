import { PaginatedResult } from "@/modules/base/interface/common.interface";
import { FinancialTransaction } from "./financial-transaction.interface";
import {
  TransactionQueryFilter,
  TrainerChartPoint,
  AdminChartPoint,
  ChartPeriod,
} from "./finance-query.interface";

export interface CreateSessionEarningInput {
  bookingId: string;
  trainerId: string;
  userId?: string;
  grossAmount: number;
  currency?: string;
  paymentId?: string;
  trainerPercentage?: number;
  platformPercentage?: number;
}

export interface TrainerFinanceSummary {
  totalEarned: number;
  totalRefunded: number;
  netEarnings: number;
  availableBalance: number;
  totalPaidOut: number;
  pendingPayout: number;
}

export interface PlatformFinanceSummary {
  grossRevenue: number;
  totalTrainerEarnings: number;
  totalPlatformEarnings: number;
  totalRefunded: number;
  pendingPayouts: number;
  completedPayouts: number;
}

export interface IFinanceService {
  createSessionEarning(input: CreateSessionEarningInput): Promise<FinancialTransaction>;
  getTrainerFinanceSummary(trainerId: string): Promise<TrainerFinanceSummary>;
  getTrainerTransactions(
    trainerId: string,
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>>;
  getTrainerChart(
    trainerId: string,
    period: ChartPeriod,
    from?: Date,
    to?: Date,
  ): Promise<TrainerChartPoint[]>;
  getPlatformFinanceSummary(): Promise<PlatformFinanceSummary>;
  getAllTransactions(
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>>;
  getAdminChart(
    period: ChartPeriod,
    from?: Date,
    to?: Date,
  ): Promise<AdminChartPoint[]>;
}
