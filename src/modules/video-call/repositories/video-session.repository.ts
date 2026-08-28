import { injectable } from "inversify";

import {
  BaseRepository,
} from "@/modules/base/repository/base.repository";

import {
  IVideoSession,
} from "../model/video-session.model";

import {
  VideoSessionModel,
} from "../model/video-session.model";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { VideoSession } from "../interface/video-session.interface";

@injectable()
export class VideoSessionRepository
  extends BaseRepository<
    VideoSession,
    IVideoSession
  >
  implements IVideoSessionRepository
{
  constructor() {
    super(VideoSessionModel);
  }

  protected toInterface(
    doc: IVideoSession,
  ): VideoSession {
    return {
      id: doc._id.toString(),

      bookingId:
        doc.bookingId.toString(),

      trainerId:
        doc.trainerId.toString(),

      userId:
        doc.userId.toString(),

      scheduledStartTime:
        doc.scheduledStartTime,

      scheduledEndTime:
        doc.scheduledEndTime,
        
      trainerStartRequestedAt:
        doc.trainerStartRequestedAt,

      userAcceptedAt:
        doc.userAcceptedAt,

        terminationReason:
        doc.terminationReason,

      actualStartTime:
        doc.actualStartTime,

      actualEndTime:
        doc.actualEndTime,

      trainerJoinedAt:
        doc.trainerJoinedAt,

      userJoinedAt:
        doc.userJoinedAt,

      trainerLeftAt:
        doc.trainerLeftAt,

      userLeftAt:
        doc.userLeftAt,

      status: doc.status,

      createdAt: doc.createdAt,

      updatedAt: doc.updatedAt,
    };
  }

  async createVideoSession(
    data: Partial<VideoSession>,
  ): Promise<VideoSession> {
    return this.create(
      data as Partial<IVideoSession>,
    );
  }

  async getByBookingId(
    bookingId: string,
  ): Promise<VideoSession | null> {
    return this.findOne({
      bookingId,
    });
  }

  async getById(
    videoSessionId: string,
  ): Promise<VideoSession | null> {
    return this.findById(videoSessionId);
  }

  async updateVideoSession(
    videoSessionId: string,
    data: Record<string, unknown>,
  ): Promise<VideoSession | null> {
    return this.updateById(
      videoSessionId,
      {
        $set: data,
      },
    );
  }

  async findSessions(
    filter: Record<string, unknown>,
  ): Promise<VideoSession[]> {
    return this.findAll(filter);
  }
}