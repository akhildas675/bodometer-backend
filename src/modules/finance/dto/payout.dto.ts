import { PayoutStatus } from "../constant/finance.constant";

export interface RequestPayoutDto {
  amount: number;
}

export interface RejectPayoutDto {
  reason: string;
}

export interface ProcessPayoutDto {
  providerPayoutId?: string;
}

export interface CompletePayoutDto {
  providerPayoutId?: string;
}

export interface FailPayoutDto {
  reason: string;
}

export interface PayoutFilterDto {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  from?: string;
  to?: string;
}
