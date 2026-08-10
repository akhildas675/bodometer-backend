import {
  CANCELLATION_NOTICE_HOURS,
  CANCELLATION_POLICY,
  CANCELLATION_REFUND_PERCENT,
  MS_PER_HOUR,
} from "@/constants/constant.values.ts/booking.constant";

export interface CancellationPolicyResult {
  refundEligible: boolean;
  refundPercentage: number;
  policyName: string;
  hoursNotice: number;
}

export function calculateUserCancellationPolicy(sessionStartTime: Date, now: Date = new Date()): CancellationPolicyResult {
  const hoursNotice = Math.max(0, (sessionStartTime.getTime() - now.getTime()) / MS_PER_HOUR);
  const roundedHours = Math.round(hoursNotice * 10) / 10;

  if (hoursNotice >= CANCELLATION_NOTICE_HOURS.ADVANCE_THRESHOLD) {
    return {
      refundEligible: true,
      refundPercentage: CANCELLATION_REFUND_PERCENT.FULL,
      policyName: CANCELLATION_POLICY.ADVANCE_24H_PLUS,
      hoursNotice: roundedHours,
    };
  } else if (hoursNotice >= CANCELLATION_NOTICE_HOURS.STANDARD_THRESHOLD) {
    return {
      refundEligible: true,
      refundPercentage: CANCELLATION_REFUND_PERCENT.PARTIAL,
      policyName: CANCELLATION_POLICY.STANDARD_6H_TO_24H,
      hoursNotice: roundedHours,
    };
  } else {
    return {
      refundEligible: false,
      refundPercentage: CANCELLATION_REFUND_PERCENT.NONE,
      policyName: CANCELLATION_POLICY.LATE_UNDER_6H,
      hoursNotice: roundedHours,
    };
  }
}

export function calculateTrainerCancellationPolicy(sessionStartTime: Date, now: Date = new Date()): CancellationPolicyResult {
  const hoursNotice = Math.max(0, (sessionStartTime.getTime() - now.getTime()) / MS_PER_HOUR);
  return {
    refundEligible: true,
    refundPercentage: CANCELLATION_REFUND_PERCENT.FULL,
    policyName: CANCELLATION_POLICY.TRAINER_FULL_REFUND,
    hoursNotice: Math.round(hoursNotice * 10) / 10,
  };
}

