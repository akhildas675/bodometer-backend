import { PayoutMethod, PayoutStatus } from "../constant/finance.constant";
import { PayoutBankDetails } from "../interface/payout-request.interface";

export interface RequestPayoutDto {
  amount: number;
  bankDetails?: PayoutBankDetails;
}

export interface RejectPayoutDto {
  reason: string;
}

export interface ProcessPayoutDto {
  providerPayoutId?: string;
  adminNote?: string;
}

export interface CompletePayoutDto {
  bankTransferReference: string;
  transferredAt?: string | Date;
  adminNote?: string;
  payoutMethod?: PayoutMethod | string;
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
