export const VIDEO_SESSION_PATHS = {
  REQUEST: "/:bookingId/request",
  ACCEPT: "/:videoSessionId/accept",
  REJECT: "/:videoSessionId/reject",
  JOIN: "/:videoSessionId/join",
  LEAVE: "/:videoSessionId/leave",
  GET_BY_ID: "/:videoSessionId",
  GET_BY_BOOKING_ID: "/booking/:bookingId",
  END: "/:videoSessionId/end",
  HISTORY: "/history",
  REFUND_REQUEST: "/:videoSessionId/refund-request",
  CLAIM_EXPIRED_REFUND: "/booking/:bookingId/claim-expired-refund",
};