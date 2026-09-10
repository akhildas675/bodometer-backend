import { Container } from "inversify";
import { IVideoSessionService } from "./interface/video.session-service.interface";

import { VIDEO_SESSION_TYPES } from "./video-session.types";

import { VideoSessionService } from "./service/video-session.service";
import VideoSessionRepository from "./repositories/video-session.repository";
import { VideoSessionController } from "./controller/video-session.controller";
import { IVideoSessionRepository } from "./interface/video.session-repository.interface";

export const loadVideoSessionBindings = (container: Container): void => {
  container
    .bind<IVideoSessionRepository>(
      VIDEO_SESSION_TYPES.VideoSessionRepository,
    )
    .to(VideoSessionRepository);

  container
    .bind<IVideoSessionService>(
      VIDEO_SESSION_TYPES.VideoSessionService,
    )
    .to(VideoSessionService);

  container
    .bind<VideoSessionController>(
      VIDEO_SESSION_TYPES.VideoSessionController,
    )
    .to(VideoSessionController);
};