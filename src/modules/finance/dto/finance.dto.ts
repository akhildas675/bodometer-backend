import {
  ChartPeriod,
  TransactionQueryFilter,
} from "../interface/finance-query.interface";
import {
  TransactionStatus,
  TransactionType,
} from "../constant/finance.constant";

export interface TransactionFilterDto extends TransactionQueryFilter {
  page?: number;
  limit?: number;
  transactionType?: TransactionType;
  status?: TransactionStatus;
  from?: Date;
  to?: Date;
}

export interface ChartQueryDto {
  period?: ChartPeriod;
  from?: string;
  to?: string;
}
