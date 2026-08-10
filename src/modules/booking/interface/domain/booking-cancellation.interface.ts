export type CancellationActor = "USER" | "TRAINER" | "ADMIN" | "SYSTEM";

export interface CancellationPolicySnapshot {
  policyName: string;
  hoursNotice: number;
  refundPercentage: number;
  appliedAt: Date;
}

export interface BookingCancellation {
  id: string;
  bookingId: string;
  cancelledBy: CancellationActor;
  cancelledByUserId: string;
  reasonCode?: string;
  reason: string;
  cancelledAt: Date;
  refundEligible: boolean;
  refundPercentage: number;
  refundAmount: number;
  policySnapshot: CancellationPolicySnapshot;
  createdAt?: Date;
  updatedAt?: Date;
}
