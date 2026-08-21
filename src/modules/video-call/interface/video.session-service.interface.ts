import { VideoSessionResponseDto } from "../dto/video-session.dto";

export interface IVideoSessionService {
  getVideoSession(
    bookingId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto>;

  requestCall(
    bookingId: string,
    trainerId: string,
  ): Promise<VideoSessionResponseDto>;

  acceptCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto>;

  rejectCall(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto>;

  joinSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto>;

  leaveSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto>;

  endSession(
    videoSessionId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto>;
}