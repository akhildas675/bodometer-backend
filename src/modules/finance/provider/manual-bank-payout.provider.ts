import { injectable } from "inversify";
import { IPayoutProvider, PayoutExecutionResult } from "../interface/payout-provider.interface";
import { PayoutRequest } from "../interface/payout-request.interface";
import { PAYOUT_METHOD } from "../constant/finance.constant";

@injectable()
export class ManualBankPayoutProvider implements IPayoutProvider {
  readonly providerName = PAYOUT_METHOD.MANUAL_BANK_TRANSFER;

  async processPayout(payout: PayoutRequest): Promise<PayoutExecutionResult> {
    // For manual bank transfer, the transfer is conducted offline by the admin
    // and confirmed via bank transfer reference / UTR entry.
    return {
      success: true,
      reference: payout.bankTransferReference,
      transferredAt: payout.transferredAt ?? new Date(),
      note: payout.adminNote,
    };
  }
}
