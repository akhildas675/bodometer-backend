import { VideoSessionResponseDto } from "../dto/video-session.dto";

export interface IVideoSessionService{
  requestCall(bookingId:string,trainerId:string):Promise<VideoSessionResponseDto>;


  acceptCall(videoSessionId:string,userId:string):Promise<VideoSessionResponseDto>

  markParticipantJoined(videoSessionId:string,
    participantId:string
  ):Promise<VideoSessionResponseDto>

  markParticipantLeft(videoSessionId:string,
    participantId:string
  ):Promise<VideoSessionResponseDto>

  getVideoSessionById(videoSessionId:string,
    participantId:string
  ):Promise<VideoSessionResponseDto>

  endVideoSession(videoSessionId:string,
    participantId:string
  ):Promise<VideoSessionResponseDto>

  rejectCall(
  videoSessionId: string,
  userId: string,
): Promise<VideoSessionResponseDto>;

  getVideoSessionByBookingId(
    bookingId: string,
    participantId: string,
  ): Promise<VideoSessionResponseDto | null>;

  requestRefund(
    videoSessionId: string,
    userId: string,
  ): Promise<VideoSessionResponseDto>;

  claimExpiredBookingRefund(
    bookingId: string,
    userId: string,
  ): Promise<{
    booking: unknown;
    refund: unknown;
    videoSession?: VideoSessionResponseDto;
  }>;

  getVideoSessionHistory(
    participantId: string,
    role: string,
    query: {
      page?: number;
      limit?: number;
      status?: string;
      refundStatus?: string;
    },
  ): Promise<{
    sessions: VideoSessionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }>;
}