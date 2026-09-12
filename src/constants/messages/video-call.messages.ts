export const VIDEO_CALL_MESSAGES = {
  VIDEO_SESSION: {
    NOT_FOUND: "Video session not found",
    UNAUTHORIZED_ACCESS: "You are not authorized to access this video session",
    UNAUTHORIZED_START: "You are not authorized to start this session",
    UNAUTHORIZED_ACCEPT: "You are not authorized to accept this call",
    UNAUTHORIZED_REJECT: "You are not authorized to reject this call",
    UNAUTHORIZED_PARTICIPANT: "You are not a participant in this video session",

    BOOKING_NOT_FOUND: "Booking not found",
    BOOKING_NOT_CONFIRMED: "This booking is not confirmed",
    ALREADY_EXISTS: "Video session already exists for this booking",
    SESSION_NOT_STARTED_YET: "The session has not started yet",
    START_WINDOW_EXPIRED: "The trainer start window has expired",

    NOT_WAITING: "This video call is no longer waiting for acceptance",
    REQUEST_TIME_MISSING: "Call request time is missing",
    ACCEPTANCE_WINDOW_EXPIRED: "The call acceptance window has expired",

    CANNOT_REJECT_STATE: "This video call cannot be rejected in its current state",
    CANNOT_JOIN_STATE: "This video session cannot be joined",
    CANNOT_START_BEFORE:"Video call cannot be started before the scheduled start time",
    NOT_ACTIVE: "Video session is not active",

    FAILED_TO_EXPIRED:"Failed to expire video session",
    FAILED_TO_ACCEPT:"Failed to Accept video call",
    FAILED_TO_UPDATE_LEAVE:"Failed to update participant leave state",
    
  

    UNABLE_TO_ACCEPT: "Unable to accept video session",
    UNABLE_TO_REJECT: "Unable to reject video session",
    UNABLE_TO_JOIN: "Unable to join video session",
    UNABLE_TO_UPDATE: "Unable to update video session",
    UNABLE_TO_END: "Unable to end video session",

    WINDOW_EXPIRED:"Video call request window has expired",
    VIDEO_SESSION_EXISTS:"A video session already exists for this booking",

    BOOKING_HAS_COMPLETED:"This booking already has a completed video session",


   
    FETCHED_SUCCESS: "Video session fetched successfully",
    REQUEST_SUCCESS: "Video call requested successfully",
    ACCEPT_SUCCESS: "Video call accepted successfully",
    REJECT_SUCCESS: "Video call rejected successfully",
    JOIN_SUCCESS: "Joined video session successfully",
    LEAVE_SUCCESS: "Left video session successfully",
    END_SUCCESS: "Video session ended successfully",
  },
} as const;
