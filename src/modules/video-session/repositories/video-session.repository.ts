import { BaseRepository } from "@/modules/base/repository/base.repository";
import { CreateVideoSessionData, VideoSession } from "../interface/video-session.interface";
import { IVideoSession, VideoSessionModel } from "../model/video-session.model";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { VIDEO_SESSION_STATUS } from "../constant/video-session.constant";
import { injectable } from "inversify";
import mongoose from "mongoose";


@injectable()
export default class VideoSessionRepository extends BaseRepository<VideoSession,IVideoSession> implements IVideoSessionRepository{
  constructor(){
    super(VideoSessionModel)
  }

  protected toInterface(doc: IVideoSession): VideoSession {
    return {
      id:doc._id.toString(),
      bookingId:doc.bookingId.toString(),
      trainerId:doc.trainerId.toString(),
      userId:doc.userId.toString(),
      scheduledStartTime:doc.scheduledStartTime,
      scheduledEndTime:doc.scheduledEndTime,
      trainerStartRequestedAt:doc.trainerStartRequestedAt,
      userAcceptedAt:doc.userAcceptedAt,
      trainerJoinedAt:doc.trainerJoinedAt,
      userJoinedAt:doc.userJoinedAt,
      actualStartTime:doc.actualStartTime,
      actualEndTime:doc.actualEndTime,

      trainerLeftAt:doc.trainerLeftAt,
      userLeftAt:doc.userLeftAt,

      status:doc.status,

      terminationReason:doc.terminationReason,
      createdAt:doc.createdAt,
      updatedAt:doc.updatedAt,


    }
  }


async createVideoSession(
    data: CreateVideoSessionData,
): Promise<VideoSession> {
    const document = await this.create({
        bookingId: new mongoose.Types.ObjectId(data.bookingId),
        trainerId: new mongoose.Types.ObjectId(data.trainerId),
        userId: new mongoose.Types.ObjectId(data.userId),
        scheduledStartTime: data.scheduledStartTime,
        scheduledEndTime: data.scheduledEndTime,
        trainerStartRequestedAt: data.trainerStartRequestedAt,
        status: data.status,
    });

    return document;
}

  async getVideoSessionById(id: string): Promise<VideoSession | null> {
    return this.findById(id)
  }

  async getVideoSessionByBookingId(bookingId: string): Promise<VideoSession | null> {
    return this.findOne({bookingId})
  }

  async updateVideoSession(videoSessionId: string, data: Partial<VideoSession>): Promise<VideoSession | null> {
    return this.updateById(videoSessionId,{$set:data})
  }

  async getActiveSessionParticipant(participantId: string): Promise<VideoSession | null> {
    return this.findOne({
      status:VIDEO_SESSION_STATUS.ACTIVE,
      $or:[
        {
          trainerId:participantId
        },
        {
          userId:participantId
        }
      ]
    })
  }


}