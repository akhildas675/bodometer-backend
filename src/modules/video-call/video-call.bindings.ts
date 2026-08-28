import { Container } from "inversify";
import { IVideoSessionRepository } from "./interface/video.session-repository.interface";
import { VIDEO_CALL_TYPES } from "./video-call.types";
import { VideoSessionRepository } from "./repositories/video-session.repository";
import { IVideoSessionService } from "./interface/video.session-service.interface";
import VideoSessionService from "./service/video-session.service";
import { VideoSessionController } from "./controller/video-session.controller";
import { VideoSessionSchedulerService } from "./service/video-session-scheduler.service";

export const loadVideoCallBindings = (container: Container) => {
  container
    .bind<IVideoSessionRepository>(VIDEO_CALL_TYPES.Repository)
    .to(VideoSessionRepository);

  container
    .bind<IVideoSessionService>(VIDEO_CALL_TYPES.Service)
    .to(VideoSessionService);

  container
    .bind<VideoSessionController>(VIDEO_CALL_TYPES.Controller)
    .to(VideoSessionController);

  container
    .bind<VideoSessionSchedulerService>(VIDEO_CALL_TYPES.SchedulerService)
    .to(VideoSessionSchedulerService)
    .inSingletonScope();
};