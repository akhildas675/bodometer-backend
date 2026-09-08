import { IVideoSession } from "../model/video-session.model";
import { VideoSession } from "./video-session.interface";

export interface IVideoSessionRepository{
  createVideoSession(data:Partial<IVideoSession>):Promise<VideoSession>;
  getVideoSessionById(id:string):Promise<VideoSession | null>;
  getVideoSessionByBookingId(bookingId:string):Promise<VideoSession | null>;
  updateVideoSession(id:string, data:Partial<IVideoSession>):Promise<VideoSession | null>;
  getActiveSessionParticipant(participantId:string):Promise<VideoSession | null>
}