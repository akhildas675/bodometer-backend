import { inject, injectable, optional } from "inversify";
import { FINANCE_TYPES } from "../finance.types";
import { IPayoutRequestRepository } from "../interface/payout-repository.interface";
import { IFinancialTransactionRepository } from "../interface/finance-repository.interface";
import {
  CompletePayoutInput,
  IPayoutService,
} from "../interface/payout-service.interface";
import {
  PayoutBankDetails,
  PayoutRequest,
} from "../interface/payout-request.interface";
import {
  AdminPayoutSummary,
  PayoutQueryFilter,
} from "../interface/payout-query.interface";
import { PaginatedResult } from "@/modules/base/interface/common.interface";
import {
  PAYOUT_CONFIG,
  PAYOUT_METHOD,
  PAYOUT_STATUS,
  isValidPayoutTransition,
} from "../constant/finance.constant";
import { AppError } from "@/utils/appError";
import { STATUS } from "@/constants/constant.values.ts/statuscode";
import { NOTIFICATION_TYPES } from "@/modules/notification/notification.types";
import { INotificationService } from "@/modules/notification/interface/notification-service.interface";
import {
  NOTIFICATION_ENTITY_TYPE,
  NOTIFICATION_TYPE,
} from "@/modules/notification/constant/notification.constant";
import { IPaymentService } from "@/modules/payment/interface/stripe-service.interface";

@injectable()
export class PayoutService implements IPayoutService {
  constructor(
    @inject(FINANCE_TYPES.PayoutRequestRepository)
    private readonly _payoutRepository: IPayoutRequestRepository,

    @inject(FINANCE_TYPES.FinancialTransactionRepository)
    private readonly _transactionRepository: IFinancialTransactionRepository,

    @optional()
    @inject(NOTIFICATION_TYPES.NotificationService)
    private readonly _notificationService?: INotificationService,

    @optional()
    @inject(FINANCE_TYPES.PaymentService)
    private readonly _paymentService?: IPaymentService,
  ) {}

  async requestPayout(
    trainerId: string,
    amount: number,
    bankDetails?: PayoutBankDetails,
  ): Promise<PayoutRequest> {
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "A valid positive payout amount is required.",
      );
    }

    if (amount < PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Minimum payout amount is ₹${PAYOUT_CONFIG.MINIMUM_PAYOUT_AMOUNT.toLocaleString("en-IN")}.`,
      );
    }

    const normalizedAmount = Math.round(amount * 100) / 100;

    // 1. Guard against duplicate active payouts
    const activePayout =
      await this._payoutRepository.findActiveByTrainerId(trainerId);
    if (activePayout) {
      throw new AppError(
        STATUS.CONFLICT,
        "You already have an active payout request in progress.",
      );
    }

    // 2. Validate sufficient available balance
    const availableBalance = await this.getTrainerAvailableBalance(trainerId);
    if (normalizedAmount > availableBalance) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Insufficient available balance. Your available balance is ₹${availableBalance.toFixed(2)}.`,
      );
    }

    const created = await this._payoutRepository.createOne({
      trainerId,
      amount: normalizedAmount,
      reservedAmount: normalizedAmount,
      currency: PAYOUT_CONFIG.DEFAULT_CURRENCY,
      status: PAYOUT_STATUS.PENDING,
      payoutMethod: PAYOUT_METHOD.MANUAL_BANK_TRANSFER,
      bankDetails,
      requestedAt: new Date(),
    });

    // Send notification
    this.sendNotificationSafe({
      recipientId: trainerId,
      type: NOTIFICATION_TYPE.PAYOUT_REQUESTED,
      entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
      entityId: created.id,
      variables: {
        amount: normalizedAmount,
        currency: PAYOUT_CONFIG.DEFAULT_CURRENCY,
      },
    });

    return created;
  }

  async getTrainerPayouts(
    trainerId: string,
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>> {
    return this._payoutRepository.findByTrainerIdPaginated(trainerId, filter);
  }

  async getTrainerActivePayout(
    trainerId: string,
  ): Promise<PayoutRequest | null> {
    return this._payoutRepository.findActiveByTrainerId(trainerId);
  }

  async getPayoutById(payoutId: string): Promise<PayoutRequest> {
    const payout = await this._payoutRepository.findById(payoutId);
    if (!payout) {
      throw new AppError(STATUS.NOT_FOUND, "Payout request not found.");
    }
    return payout;
  }

  async getTrainerAvailableBalance(trainerId: string): Promise<number> {
    const [earnings, payouts] = await Promise.all([
      this._transactionRepository.aggregateTrainerEarnings(trainerId),
      this._payoutRepository.getPayoutTotalsByTrainerId(trainerId),
    ]);

    const netEarnings =
      Math.round((earnings.totalEarned - earnings.totalRefunded) * 100) / 100;
    return Math.max(
      0,
      Math.round(
        (netEarnings - payouts.totalReserved - payouts.totalPaid) * 100,
      ) / 100,
    );
  }

  async getAllPayouts(
    filter: PayoutQueryFilter,
  ): Promise<PaginatedResult<PayoutRequest>> {
    return this._payoutRepository.findAllPaginated(filter);
  }

  async approvePayout(
    payoutId: string,
    adminId?: string,
  ): Promise<PayoutRequest> {
    const payout = await this.getPayoutById(payoutId);

    if (!isValidPayoutTransition(payout.status, PAYOUT_STATUS.APPROVED)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot approve payout with status '${payout.status}'. Only PENDING requests can be approved.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.APPROVED,
      approvedAt: new Date(),
      processedBy: adminId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    this.sendNotificationSafe({
      recipientId: updated.trainerId,
      type: NOTIFICATION_TYPE.PAYOUT_APPROVED,
      entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
      entityId: updated.id,
      variables: {
        amount: updated.amount,
        currency: updated.currency,
      },
    });

    return updated;
  }

  async rejectPayout(
    payoutId: string,
    reason: string,
    adminId?: string,
  ): Promise<PayoutRequest> {
    if (!reason || !reason.trim()) {
      throw new AppError(STATUS.BAD_REQUEST, "Rejection reason is required.");
    }

    const payout = await this.getPayoutById(payoutId);

    if (!isValidPayoutTransition(payout.status, PAYOUT_STATUS.REJECTED)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot reject payout with status '${payout.status}'. Only PENDING requests can be rejected.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.REJECTED,
      rejectionReason: reason.trim(),
      rejectedAt: new Date(),
      processedBy: adminId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    this.sendNotificationSafe({
      recipientId: updated.trainerId,
      type: NOTIFICATION_TYPE.PAYOUT_REJECTED,
      entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
      entityId: updated.id,
      variables: {
        amount: updated.amount,
        currency: updated.currency,
        reason: reason.trim(),
      },
    });

    return updated;
  }

  async processPayout(
    payoutId: string,
    input?: { providerPayoutId?: string; adminNote?: string },
    adminId?: string,
  ): Promise<PayoutRequest> {
    const payout = await this.getPayoutById(payoutId);

    if (!isValidPayoutTransition(payout.status, PAYOUT_STATUS.PROCESSING)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot process payout with status '${payout.status}'. Only APPROVED requests can be moved to PROCESSING.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.PROCESSING,
      processedAt: new Date(),
      providerPayoutId: input?.providerPayoutId,
      adminNote: input?.adminNote,
      processedBy: adminId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    this.sendNotificationSafe({
      recipientId: updated.trainerId,
      type: NOTIFICATION_TYPE.PAYOUT_PROCESSING,
      entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
      entityId: updated.id,
      variables: {
        amount: updated.amount,
        currency: updated.currency,
      },
    });

    return updated;
  }

  async recordBankTransferAndComplete(
    payoutId: string,
    input: CompletePayoutInput,
    adminId?: string,
  ): Promise<PayoutRequest> {
    const ref = input.bankTransferReference?.trim() || input.providerPayoutId?.trim();
    if (!ref) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        "Bank transfer reference / UTR is required to mark payout as paid.",
      );
    }

    const payout = await this.getPayoutById(payoutId);

    if (!isValidPayoutTransition(payout.status, PAYOUT_STATUS.PAID)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot mark payout as paid with status '${payout.status}'. Only PROCESSING requests can be completed.`,
      );
    }

    const transferredAt = input.transferredAt
      ? new Date(input.transferredAt)
      : new Date();

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.PAID,
      completedAt: new Date(),
      transferredAt,
      bankTransferReference: ref,
      providerPayoutId: ref,
      payoutMethod: input.payoutMethod || PAYOUT_METHOD.MANUAL_BANK_TRANSFER,
      adminNote: input.adminNote,
      processedBy: adminId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    this.sendNotificationSafe({
      recipientId: updated.trainerId,
      type: NOTIFICATION_TYPE.PAYOUT_PAID,
      entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
      entityId: updated.id,
      variables: {
        amount: updated.amount,
        currency: updated.currency,
        reference: ref,
      },
    });

    return updated;
  }

  async completePayout(
    payoutId: string,
    providerPayoutId?: string,
    adminId?: string,
  ): Promise<PayoutRequest> {
    return this.recordBankTransferAndComplete(
      payoutId,
      {
        bankTransferReference: providerPayoutId || `MANUAL-${Date.now()}`,
        providerPayoutId,
      },
      adminId,
    );
  }

  async failPayout(
    payoutId: string,
    reason: string,
    adminId?: string,
  ): Promise<PayoutRequest> {
    if (!reason || !reason.trim()) {
      throw new AppError(STATUS.BAD_REQUEST, "Failure reason is required.");
    }

    const payout = await this.getPayoutById(payoutId);

    if (!isValidPayoutTransition(payout.status, PAYOUT_STATUS.FAILED)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot fail payout with status '${payout.status}'. Only PROCESSING requests can be marked as failed.`,
      );
    }

    const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.FAILED,
      failureReason: reason.trim(),
      failedAt: new Date(),
      processedBy: adminId,
    });

    if (!updated) {
      throw new AppError(STATUS.NOT_FOUND, "Failed to update payout request.");
    }

    this.sendNotificationSafe({
      recipientId: updated.trainerId,
      type: NOTIFICATION_TYPE.PAYOUT_FAILED,
      entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
      entityId: updated.id,
      variables: {
        amount: updated.amount,
        currency: updated.currency,
        reason: reason.trim(),
      },
    });

    return updated;
  }

  async getAdminPayoutSummary(): Promise<AdminPayoutSummary> {
    return this._payoutRepository.getAdminPayoutSummary();
  }

  /**
   * Atomically approves a payout request and immediately disburses the funds
   * via Stripe Payouts API. The Stripe payout ID is stored as the
   * bankTransferReference / providerPayoutId on the record.
   *
   * Flow: PENDING → APPROVED (internal) → PROCESSING (internal) → PAID
   *
   * If the Stripe call fails, the payout is marked as FAILED so the admin
   * can retry via the manual bank transfer flow.
   */
  async approveAndPayViaStripe(
    payoutId: string,
    adminId?: string,
  ): Promise<PayoutRequest> {
    const payout = await this.getPayoutById(payoutId);

    if (!isValidPayoutTransition(payout.status, PAYOUT_STATUS.APPROVED)) {
      throw new AppError(
        STATUS.BAD_REQUEST,
        `Cannot approve payout with status '${payout.status}'. Only PENDING requests can be approved and paid.`,
      );
    }

    if (!this._paymentService) {
      throw new AppError(
        STATUS.INTERNAL_SERVER,
        "Stripe payment service is not configured. Please use the manual bank transfer flow.",
      );
    }

    // Step 1: Mark as APPROVED
    await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.APPROVED,
      approvedAt: new Date(),
      processedBy: adminId,
    });

    // Step 2: Mark as PROCESSING
    await this._payoutRepository.updatePayoutStatus(payoutId, {
      status: PAYOUT_STATUS.PROCESSING,
      processedAt: new Date(),
      processedBy: adminId,
      adminNote: "Stripe automated disbursement initiated.",
    });

    // Step 3: Execute Stripe payout
    try {
      // Convert amount to smallest currency unit (paise for INR)
      const amountInSmallestUnit = Math.round(payout.amount * 100);

      const stripeResult = await this._paymentService.createTrainerPayout({
        amountInSmallestUnit,
        currency: payout.currency,
        description: `Trainer payout — Payout ID: ${payout.id}`,
        metadata: {
          payoutId: payout.id,
          trainerId: payout.trainerId,
          ...(adminId ? { approvedBy: adminId } : {}),
        },
        statementDescriptor: `Trainer Pay ${payout.id.slice(-8).toUpperCase()}`,
      });

      // Step 4: Mark as PAID with Stripe payout ID
      const updated = await this._payoutRepository.updatePayoutStatus(payoutId, {
        status: PAYOUT_STATUS.PAID,
        completedAt: new Date(),
        transferredAt: new Date(),
        bankTransferReference: stripeResult.stripePayoutId,
        providerPayoutId: stripeResult.stripePayoutId,
        payoutMethod: PAYOUT_METHOD.STRIPE,
        adminNote: `Stripe payout ${stripeResult.stripePayoutId} — status: ${stripeResult.status}`,
        processedBy: adminId,
      });

      if (!updated) {
        throw new AppError(STATUS.NOT_FOUND, "Failed to update payout after Stripe transfer.");
      }

      this.sendNotificationSafe({
        recipientId: updated.trainerId,
        type: NOTIFICATION_TYPE.PAYOUT_PAID,
        entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
        entityId: updated.id,
        variables: {
          amount: updated.amount,
          currency: updated.currency,
          reference: stripeResult.stripePayoutId,
        },
      });

      return updated;
    } catch (stripeErr) {
      // If Stripe fails, roll back to FAILED so admin can retry via manual flow
      console.error("[PayoutService] Stripe payout failed:", stripeErr);

      const errorMsg =
        stripeErr instanceof Error
          ? stripeErr.message
          : "Stripe payout failed. Please retry via manual bank transfer.";

      const failed = await this._payoutRepository.updatePayoutStatus(payoutId, {
        status: PAYOUT_STATUS.FAILED,
        failureReason: `Stripe error: ${errorMsg}`,
        failedAt: new Date(),
        processedBy: adminId,
      });

      if (failed) {
        this.sendNotificationSafe({
          recipientId: failed.trainerId,
          type: NOTIFICATION_TYPE.PAYOUT_FAILED,
          entityType: NOTIFICATION_ENTITY_TYPE.PAYOUT,
          entityId: failed.id,
          variables: {
            amount: failed.amount,
            currency: failed.currency,
            reason: `Stripe error: ${errorMsg}`,
          },
        });
      }

      throw new AppError(
        STATUS.BAD_GATEWAY,
        `Stripe payout failed: ${errorMsg}`,
      );
    }
  }

  private sendNotificationSafe(data: {
    recipientId: string;
    type: (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
    entityType: (typeof NOTIFICATION_ENTITY_TYPE)[keyof typeof NOTIFICATION_ENTITY_TYPE];
    entityId: string;
    variables?: Record<string, string | number>;
  }): void {
    if (this._notificationService) {
      this._notificationService
        .createNotification({
          recipientId: data.recipientId,
          type: data.type,
          entityType: data.entityType,
          entityId: data.entityId,
          variables: data.variables,
        })
        .catch((err) => {
          console.error("[PayoutService] Notification send error:", err);
        });
    }
  }
}
