import { CreateVideoSessionData, VideoSession } from "./video-session.interface";

export interface IVideoSessionRepository{
  createVideoSession(data:CreateVideoSessionData):Promise<VideoSession>;
  getVideoSessionById(id:string):Promise<VideoSession | null>;
  getVideoSessionByBookingId(bookingId:string):Promise<VideoSession | null>;
 updateVideoSession(
    id: string,
    data: Partial<VideoSession>
): Promise<VideoSession | null>;
  getActiveSessionParticipant(participantId:string):Promise<VideoSession | null>
}