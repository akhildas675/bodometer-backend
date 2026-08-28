import { VideoSession } from "./video-session.interface";

export interface IVideoSessionRepository {
  createVideoSession(
    data: Partial<VideoSession>,
  ): Promise<VideoSession>;

  getByBookingId(
    bookingId: string,
  ): Promise<VideoSession | null>;

  getById(
    videoSessionId: string,
  ): Promise<VideoSession | null>;

  updateVideoSession(
    videoSessionId: string,
    data: Record<string, unknown>,
  ): Promise<VideoSession | null>;

  findSessions(
    filter: Record<string, unknown>,
  ): Promise<VideoSession[]>;
}