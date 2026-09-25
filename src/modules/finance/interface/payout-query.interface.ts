import { PayoutStatus } from "../constant/finance.constant";

export interface PayoutQueryFilter {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  from?: Date;
  to?: Date;
}

export interface PayoutTotals {
  totalReserved: number;
  totalPaid: number;
}

export interface AdminPayoutSummary {
  pendingAmount: number;
  paidAmount: number;
}
