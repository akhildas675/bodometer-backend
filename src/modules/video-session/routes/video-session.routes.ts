import { Router } from "express";
import container from "@/container/container";


import { validate } from "@/middleware/validate";
import { VideoSessionController } from "../controller/video-session.controller";
import { VIDEO_SESSION_TYPES } from "../video-session.types";
import { VIDEO_SESSION_PATHS } from "../constant/routes.constant/video-session.constant";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import {
  acceptVideoCallSchema,
  endVideoSessionSchema,
  getVideoSessionByBookingIdSchema,
  getVideoSessionHistorySchema,
  getVideoSessionSchema,
  joinVideoSessionSchema,
  leaveVideoSessionSchema,
  rejectVideoCallSchema,
  requestRefundSchema,
  requestVideoCallSchema,
  claimExpiredRefundSchema,
} from "../validation/video-session.validation";

const videoSessionController =
  container.get<VideoSessionController>(
    VIDEO_SESSION_TYPES.VideoSessionController,
  );

const videoSessionRoute = Router();

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.REQUEST,
  ROLE_GUARD.TRAINER_GUARD,
  validate(requestVideoCallSchema),
  videoSessionController.requestCall,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.ACCEPT,
  ROLE_GUARD.USER_GUARD,
  validate(acceptVideoCallSchema),
  videoSessionController.acceptCall,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.REJECT,
  ROLE_GUARD.USER_GUARD,
  validate(rejectVideoCallSchema),
  videoSessionController.rejectCall,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.JOIN,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(joinVideoSessionSchema),
  videoSessionController.markParticipantJoined,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.LEAVE,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(leaveVideoSessionSchema),
  videoSessionController.markParticipantLeft,
);

// HISTORY and GET_BY_BOOKING_ID must come before GET_BY_ID so Express doesn't treat
// literal paths as :videoSessionId
videoSessionRoute.get(
  VIDEO_SESSION_PATHS.HISTORY,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(getVideoSessionHistorySchema),
  videoSessionController.getVideoSessionHistory,
);

videoSessionRoute.get(
  VIDEO_SESSION_PATHS.GET_BY_BOOKING_ID,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(getVideoSessionByBookingIdSchema),
  videoSessionController.getVideoSessionByBookingId,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.CLAIM_EXPIRED_REFUND,
  ROLE_GUARD.USER_GUARD,
  validate(claimExpiredRefundSchema),
  videoSessionController.claimExpiredSessionRefund,
);

videoSessionRoute.get(
  VIDEO_SESSION_PATHS.GET_BY_ID,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(getVideoSessionSchema),
  videoSessionController.getVideoSessionById,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.END,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(endVideoSessionSchema),
  videoSessionController.endVideoSession,
);

videoSessionRoute.post(
  VIDEO_SESSION_PATHS.REFUND_REQUEST,
  ROLE_GUARD.USER_GUARD,
  validate(requestRefundSchema),
  videoSessionController.requestRefund,
);

export default videoSessionRoute;