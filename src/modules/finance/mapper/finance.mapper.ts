import { PayoutRequest } from "../interface/payout-request.interface";
import { FinancialTransaction } from "../interface/financial-transaction.interface";

export class FinanceMapper {
  static toPayoutResponse(payout: PayoutRequest): PayoutRequest {
    return {
      id: payout.id,
      trainerId: payout.trainerId,
      amount: payout.amount,
      reservedAmount: payout.reservedAmount,
      currency: payout.currency,
      status: payout.status,
      payoutMethod: payout.payoutMethod,
      bankTransferReference: payout.bankTransferReference,
      transferredAt: payout.transferredAt,
      processedBy: payout.processedBy,
      adminNote: payout.adminNote,
      bankDetails: payout.bankDetails,
      providerPayoutId: payout.providerPayoutId,
      rejectionReason: payout.rejectionReason,
      failureReason: payout.failureReason,
      requestedAt: payout.requestedAt,
      approvedAt: payout.approvedAt,
      processedAt: payout.processedAt,
      completedAt: payout.completedAt,
      rejectedAt: payout.rejectedAt,
      failedAt: payout.failedAt,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    };
  }

  static toTransactionResponse(tx: FinancialTransaction): FinancialTransaction {
    return {
      id: tx.id,
      bookingId: tx.bookingId,
      paymentId: tx.paymentId,
      userId: tx.userId,
      trainerId: tx.trainerId,
      grossAmount: tx.grossAmount,
      trainerAmount: tx.trainerAmount,
      platformAmount: tx.platformAmount,
      trainerPercentage: tx.trainerPercentage,
      platformPercentage: tx.platformPercentage,
      currency: tx.currency,
      transactionType: tx.transactionType,
      status: tx.status,
      referenceKey: tx.referenceKey,
      relatedTransactionId: tx.relatedTransactionId,
      note: tx.note,
      serviceName: tx.serviceName,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }
}
