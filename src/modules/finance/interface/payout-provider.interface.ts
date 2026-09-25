import { PayoutRequest } from "./payout-request.interface";

export interface PayoutExecutionResult {
  success: boolean;
  reference?: string;
  transferredAt?: Date;
  note?: string;
  errorMessage?: string;
}

export interface IPayoutProvider {
  readonly providerName: string;
  processPayout(payout: PayoutRequest): Promise<PayoutExecutionResult>;
}
