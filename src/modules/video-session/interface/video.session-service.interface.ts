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
}