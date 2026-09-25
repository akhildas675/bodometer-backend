import { PaginatedResult } from "@/modules/base/interface/common.interface";
import {
  PayoutRequest,
  CreatePayoutRequestInput,
  UpdatePayoutStatusInput,
} from "./payout-request.interface";
import {
  PayoutQueryFilter,
  PayoutTotals,
  AdminPayoutSummary,
} from "./payout-query.interface";

export interface IPayoutRequestRepository {
  createOne(input: CreatePayoutRequestInput): Promise<PayoutRequest>;
  findById(id: string): Promise<PayoutRequest | null>;
  findByTrainerIdPaginated(
    trainerId: string,
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>>;
  findActiveByTrainerId(trainerId: string): Promise<PayoutRequest | null>;
  findAllPaginated(
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>>;
  updatePayoutStatus(
    id: string,
    input: UpdatePayoutStatusInput,
  ): Promise<PayoutRequest | null>;
  getPayoutTotalsByTrainerId(trainerId: string): Promise<PayoutTotals>;
  getAdminPayoutSummary(): Promise<AdminPayoutSummary>;
}
