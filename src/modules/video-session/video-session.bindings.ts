import { Container } from "inversify";
import { IVideoSessionRepository } from "./interface/video.session-repository.interface";
import { VIDEO_SESSION_TYPES } from "./video-session.types";

import { IVideoSessionService } from "./interface/video.session-service.interface";
import { VideoSessionService } from "./service/video-session.service";
import VideoSessionRepository from "./repositories/video-session.repository";

export const loadVideoSessionBindings = (container:Container)=>{
  container.bind<IVideoSessionRepository>(VIDEO_SESSION_TYPES.VideoSessionRepository)
  .to(VideoSessionRepository)

  container.bind<IVideoSessionService>(VIDEO_SESSION_TYPES.VideoSessionService)
  .to(VideoSessionService)
}