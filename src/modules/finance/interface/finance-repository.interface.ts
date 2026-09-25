import { PaginatedResult } from "@/modules/base/interface/common.interface";
import {
  FinancialTransaction,
  CreateFinancialTransactionInput,
} from "./financial-transaction.interface";
import {
  TransactionQueryFilter,
  TrainerEarningTotals,
  PlatformEarningTotals,
  TrainerChartPoint,
  AdminChartPoint,
  ChartPeriod,
} from "./finance-query.interface";

export interface IFinancialTransactionRepository {
  createOne(input: CreateFinancialTransactionInput): Promise<FinancialTransaction>;
  findByReferenceKey(referenceKey: string): Promise<FinancialTransaction | null>;
  findByBookingId(bookingId: string): Promise<FinancialTransaction[]>;
  findByTrainerIdPaginated(
    trainerId: string,
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>>;
  findAllPaginated(
    filter: TransactionQueryFilter,
  ): Promise<PaginatedResult<FinancialTransaction>>;
  reverseTransaction(id: string): Promise<FinancialTransaction | null>;
  aggregateTrainerEarnings(trainerId: string): Promise<TrainerEarningTotals>;
  aggregatePlatformEarnings(): Promise<PlatformEarningTotals>;
  aggregateTrainerChart(
    trainerId: string,
    period: ChartPeriod,
    from: Date,
    to: Date,
  ): Promise<TrainerChartPoint[]>;
  aggregateAdminChart(
    period: ChartPeriod,
    from: Date,
    to: Date,
  ): Promise<AdminChartPoint[]>;
}
