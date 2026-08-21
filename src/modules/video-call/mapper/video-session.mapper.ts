import { VideoSessionResponseDto } from "../dto/video-session.dto";
import { VideoSession } from "../interface/video-session.interface";

export class VideoSessionMapper {
  public static toResponse(
    session: VideoSession,
  ): VideoSessionResponseDto {
    return {
      id: session.id,
      bookingId: session.bookingId,
      trainerId: session.trainerId,
      userId: session.userId,

      scheduledStartTime:
        session.scheduledStartTime,

      scheduledEndTime:
        session.scheduledEndTime,

      trainerStartRequestedAt:
        session.trainerStartRequestedAt,

      userAcceptedAt:
        session.userAcceptedAt,

      actualStartTime:
        session.actualStartTime,

      actualEndTime:
        session.actualEndTime,

      trainerJoinedAt:
        session.trainerJoinedAt,

      userJoinedAt:
        session.userJoinedAt,

      trainerLeftAt:
        session.trainerLeftAt,

      userLeftAt:
        session.userLeftAt,

      status: session.status,

      terminationReason:
        session.terminationReason,

      createdAt: session.createdAt,

      updatedAt: session.updatedAt,
    };
  }
}