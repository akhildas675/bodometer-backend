import { Router } from "express";
import container from "@/container/container";
import { VIDEO_CALL_TYPES } from "../video-call.types";
import { VideoSessionController } from "../controller/video-session.controller";
import { ROLE_GUARD } from "@/constants/constant.values.ts/role.guard";
import { VIDEO_CALL_PATHS } from "@/constants/routes.constant/video-call.paths";
import { validate } from "@/middleware/validate";
import {
  acceptCallSchema,
  endSessionSchema,
  getVideoSessionSchema,
  joinSessionSchema,
  leaveSessionSchema,
  rejectCallSchema,
  requestCallSchema,
} from "../validation/video-session.validation";

const videoSessionController = container.get<VideoSessionController>(
  VIDEO_CALL_TYPES.Controller,
);

const videoCallRoute = Router();

videoCallRoute.get(
  VIDEO_CALL_PATHS.GET_SESSION,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(getVideoSessionSchema),
  videoSessionController.getVideoSession,
);

videoCallRoute.post(
  VIDEO_CALL_PATHS.REQUEST_CALL,
  ROLE_GUARD.TRAINER_GUARD,
  validate(requestCallSchema),
  videoSessionController.requestCall,
);

videoCallRoute.post(
  VIDEO_CALL_PATHS.ACCEPT_CALL,
  ROLE_GUARD.USER_GUARD,
  validate(acceptCallSchema),
  videoSessionController.acceptCall,
);

videoCallRoute.post(
  VIDEO_CALL_PATHS.REJECT_CALL,
  ROLE_GUARD.USER_GUARD,
  validate(rejectCallSchema),
  videoSessionController.rejectCall,
);

videoCallRoute.post(
  VIDEO_CALL_PATHS.JOIN_SESSION,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(joinSessionSchema),
  videoSessionController.joinSession,
);

videoCallRoute.post(
  VIDEO_CALL_PATHS.LEAVE_SESSION,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(leaveSessionSchema),
  videoSessionController.leaveSession,
);

videoCallRoute.post(
  VIDEO_CALL_PATHS.END_SESSION,
  ROLE_GUARD.USER_TRAINER_GUARD,
  validate(endSessionSchema),
  videoSessionController.endSession,
);

export default videoCallRoute;
