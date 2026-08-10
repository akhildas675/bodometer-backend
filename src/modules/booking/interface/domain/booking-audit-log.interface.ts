export type BookingAuditAction =
  | "CREATED"
  | "STATUS_CHANGED"
  | "RESCHEDULED"
  | "RESCHEDULE_PROPOSED"
  | "RESCHEDULE_RESPONDED"
  | "CANCELLED"
  | "ATTENDANCE_MARKED";

export interface BookingAuditLog {
  id: string;
  bookingId: string;
  action: BookingAuditAction;
  performedBy: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  reason?: string;
  createdAt?: Date;
}
