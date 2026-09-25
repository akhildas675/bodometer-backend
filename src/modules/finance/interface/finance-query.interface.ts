import {
  TransactionStatus,
  TransactionType,
} from "../constant/finance.constant";

export type ChartPeriod = "daily" | "weekly" | "monthly";

export interface TransactionQueryFilter {
  page?: number;
  limit?: number;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  from?: Date;
  to?: Date;
}

export interface TrainerEarningTotals {
  totalEarned: number;
  totalRefunded: number;
}

export interface PlatformEarningTotals {
  grossRevenue: number;
  totalTrainerEarnings: number;
  totalPlatformEarnings: number;
  totalRefunded: number;
}

export interface TrainerChartPoint {
  label: string;
  earnings: number;
}

export interface AdminChartPoint {
  label: string;
  grossRevenue: number;
  trainerEarnings: number;
  platformEarnings: number;
}
