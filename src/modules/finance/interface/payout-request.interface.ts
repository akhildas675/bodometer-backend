import {  PayoutMethod, PayoutStatus } from "../constant/finance.constant";

export interface PayoutBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
}

export interface PayoutRequest {
  id: string;
  trainerId: string;
  amount: number;
  reservedAmount: number;
  currency: string;
  status: PayoutStatus;
  payoutMethod?: PayoutMethod | string;
  bankTransferReference?: string;
  transferredAt?: Date;
  processedBy?: string;
  adminNote?: string;
  bankDetails?: PayoutBankDetails;
  providerPayoutId?: string;
  rejectionReason?: string;
  failureReason?: string;
  requestedAt: Date;
  approvedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  failedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePayoutRequestInput {
  trainerId: string;
  amount: number;
  reservedAmount: number;
  currency: string;
  status: PayoutStatus;
  payoutMethod?: PayoutMethod | string;
  bankDetails?: PayoutBankDetails;
  requestedAt: Date;
}

export interface UpdatePayoutStatusInput {
  status: PayoutStatus;
  payoutMethod?: PayoutMethod | string;
  bankTransferReference?: string;
  transferredAt?: Date;
  processedBy?: string;
  adminNote?: string;
  providerPayoutId?: string;
  rejectionReason?: string;
  failureReason?: string;
  approvedAt?: Date;
  processedAt?: Date;
  completedAt?: Date;
  rejectedAt?: Date;
  failedAt?: Date;
}
