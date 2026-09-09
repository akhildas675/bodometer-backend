import { BaseRepository } from "@/modules/base/repository/base.repository";
import { VideoSession } from "../interface/video-session.interface";
import { IVideoSession, VideoSessionModel } from "../model/video-session.model";
import { IVideoSessionRepository } from "../interface/video.session-repository.interface";
import { VIDEO_SESSION_STATUS } from "../constant/video-session.constant";
import { injectable } from "inversify";


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
      scheduleStartTime:doc.scheduleStartTime,
      scheduleEndTime:doc.scheduleEndTime,
      trainerStartsRequestedAt:doc.trainerStartRequestAt,
      userAcceptedAt:doc.userAcceptAt,
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


  async createVideoSession(data: Partial<IVideoSession>): Promise<VideoSession> {
    return this.create(data)
  }

  async getVideoSessionById(id: string): Promise<VideoSession | null> {
    return this.findById(id)
  }

  async getVideoSessionByBookingId(bookingId: string): Promise<VideoSession | null> {
    return this.findOne({bookingId})
  }

  async updateVideoSession(videoSessionId: string, data: Partial<IVideoSession>): Promise<VideoSession | null> {
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