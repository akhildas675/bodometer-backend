import { BaseRepository } from "@/modules/base/repository/base.repository";
import { CreateVideoSessionData, VideoSession } from "../interface/video-session.interface";
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
      id: doc._id.toString(),
      bookingId: doc.bookingId.toString(),
      trainerId: doc.trainerId.toString(),
      userId: doc.userId.toString(),
      scheduledStartTime: doc.scheduledStartTime,
      scheduledEndTime: doc.scheduledEndTime,
      trainerStartRequestedAt: doc.trainerStartRequestedAt,
      userAcceptedAt: doc.userAcceptedAt,
      trainerJoinedAt: doc.trainerJoinedAt,
      userJoinedAt: doc.userJoinedAt,
      actualStartTime: doc.actualStartTime,
      actualEndTime: doc.actualEndTime,
      actualDurationMinutes: doc.actualDurationMinutes,
      trainerLeftAt: doc.trainerLeftAt,
      userLeftAt: doc.userLeftAt,
      status: doc.status,
      terminationReason: doc.terminationReason,
      refundEligible: doc.refundEligible,
      refundStatus: doc.refundStatus,
      refundId: doc.refundId,
      refundRequestedAt: doc.refundRequestedAt,
      refundProcessedAt: doc.refundProcessedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createVideoSession(
    data: CreateVideoSessionData,
  ): Promise<VideoSession> {
    const doc = new VideoSessionModel({
      bookingId: data.bookingId,
      trainerId: data.trainerId,
      userId: data.userId,
      scheduledStartTime: data.scheduledStartTime,
      scheduledEndTime: data.scheduledEndTime,
      trainerStartRequestedAt: data.trainerStartRequestedAt,
      status: data.status,
    });
    await doc.save();
    return this.toInterface(doc);
  }

  async getVideoSessionById(id: string): Promise<VideoSession | null> {
    return this.findById(id);
  }

  async getVideoSessionByBookingId(bookingId: string): Promise<VideoSession | null> {
    return this.findOne({ bookingId });
  }

  async updateVideoSession(videoSessionId: string, data: Partial<VideoSession>): Promise<VideoSession | null> {
    return this.updateById(videoSessionId, { $set: data });
  }

  async getActiveSessionParticipant(participantId: string): Promise<VideoSession | null> {
    return this.findOne({
      status: VIDEO_SESSION_STATUS.ACTIVE,
      $or: [
        { trainerId: participantId },
        { userId: participantId },
      ],
    });
  }

  async getSessionHistory(
    filter: Record<string, unknown>,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ sessions: VideoSession[]; total: number }> {
    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      this.model.find(filter).sort({ scheduledStartTime: -1 }).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      sessions: docs.map((doc) => this.toInterface(doc)),
      total,
    };
  }
}