import { VideoSession } from "../interface/video-session.interface";
import { VideoSessionResponseDto } from "../dto/video-session.dto";

export class VideoSessionMapper {
    static toVideoSessionResponseDto(
        videoSession: VideoSession,
    ): VideoSessionResponseDto {
        return {
            id: videoSession.id!,
            bookingId: videoSession.bookingId,
            trainerId: videoSession.trainerId,
            userId: videoSession.userId,
            scheduledStartTime: videoSession.scheduledStartTime,
            scheduledEndTime: videoSession.scheduledEndTime,
            trainerStartRequestedAt:
                videoSession.trainerStartRequestedAt,
            userAcceptedAt: videoSession.userAcceptedAt,
            trainerJoinedAt: videoSession.trainerJoinedAt,
            userJoinedAt: videoSession.userJoinedAt,
            actualStartTime: videoSession.actualStartTime,
            actualEndTime: videoSession.actualEndTime,
            trainerLeftAt: videoSession.trainerLeftAt,
            userLeftAt: videoSession.userLeftAt,
            status: videoSession.status,
            terminationReason: videoSession.terminationReason,
            createdAt: videoSession.createdAt,
            updatedAt: videoSession.updatedAt,
        };
    }

    static toVideoSessionResponseDtoList(
        videoSessions: VideoSession[],
    ): VideoSessionResponseDto[] {
        return videoSessions.map((videoSession) =>
            this.toVideoSessionResponseDto(videoSession),
        );
    }
}