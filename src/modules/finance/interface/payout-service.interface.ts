import { PaginatedResult } from "@/modules/base/interface/common.interface";
import { PayoutRequest } from "./payout-request.interface";
import { PayoutQueryFilter, AdminPayoutSummary } from "./payout-query.interface";

export interface IPayoutService {
  requestPayout(trainerId: string, amount: number): Promise<PayoutRequest>;
  getTrainerPayouts(
    trainerId: string,
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>>;
  getTrainerActivePayout(trainerId: string): Promise<PayoutRequest | null>;
  getTrainerAvailableBalance(trainerId: string): Promise<number>;
  getAllPayouts(
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>>;
  approvePayout(payoutId: string): Promise<PayoutRequest>;
  rejectPayout(payoutId: string, reason: string): Promise<PayoutRequest>;
  processPayout(payoutId: string, providerPayoutId?: string): Promise<PayoutRequest>;
  completePayout(payoutId: string, providerPayoutId?: string): Promise<PayoutRequest>;
  failPayout(payoutId: string, reason: string): Promise<PayoutRequest>;
  getAdminPayoutSummary(): Promise<AdminPayoutSummary>;
}
