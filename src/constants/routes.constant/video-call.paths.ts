export const VIDEO_CALL_PATHS = {
  GET_SESSION: "/booking/:bookingId",
  REQUEST_CALL: "/request",
  ACCEPT_CALL: "/:id/accept",
  REJECT_CALL: "/:id/reject",
  JOIN_SESSION: "/:id/join",
  LEAVE_SESSION: "/:id/leave",
  END_SESSION: "/:id/end",
} as const;
