import { PaginatedResult } from "@/modules/base/interface/common.interface";
import { PayoutBankDetails, PayoutRequest } from "./payout-request.interface";
import { PayoutQueryFilter, AdminPayoutSummary } from "./payout-query.interface";

export interface CompletePayoutInput {
  bankTransferReference: string;
  transferredAt?: Date;
  adminNote?: string;
  payoutMethod?: string;
  providerPayoutId?: string;
}

export interface IPayoutService {
  requestPayout(
    trainerId: string,
    amount: number,
    bankDetails?: PayoutBankDetails,
  ): Promise<PayoutRequest>;
  getTrainerPayouts(
    trainerId: string,
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>>;
  getTrainerActivePayout(trainerId: string): Promise<PayoutRequest | null>;
  getPayoutById(payoutId: string): Promise<PayoutRequest>;
  getTrainerAvailableBalance(trainerId: string): Promise<number>;
  getAllPayouts(
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>>;
  approvePayout(payoutId: string, adminId?: string): Promise<PayoutRequest>;
  rejectPayout(
    payoutId: string,
    reason: string,
    adminId?: string,
  ): Promise<PayoutRequest>;
  processPayout(
    payoutId: string,
    input?: { providerPayoutId?: string; adminNote?: string },
    adminId?: string,
  ): Promise<PayoutRequest>;
  recordBankTransferAndComplete(
    payoutId: string,
    input: CompletePayoutInput,
    adminId?: string,
  ): Promise<PayoutRequest>;
  completePayout(
    payoutId: string,
    providerPayoutId?: string,
    adminId?: string,
  ): Promise<PayoutRequest>;
  failPayout(
    payoutId: string,
    reason: string,
    adminId?: string,
  ): Promise<PayoutRequest>;
  getAdminPayoutSummary(): Promise<AdminPayoutSummary>;
  approveAndPayViaStripe(payoutId: string, adminId?: string): Promise<PayoutRequest>;
}
