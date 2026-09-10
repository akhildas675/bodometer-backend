import { VideoSessionStatus, VideoSessionTerminationReason } from "../constant/video-session.constant";

export interface VideoSession {
  id?: string;
  bookingId: string;
  trainerId: string;
  userId: string;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  trainerStartRequestedAt: Date;
  userAcceptedAt?: Date;
  trainerJoinedAt?: Date;
  userJoinedAt?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  trainerLeftAt?: Date;
  userLeftAt?: Date;
  status: VideoSessionStatus;
  terminationReason?: VideoSessionTerminationReason;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface CreateVideoSessionData{
  bookingId:string,
  trainerId:string,
  userId:string,
  scheduledStartTime:Date,
  scheduledEndTime:Date,
  trainerStartRequestedAt:Date,
  status:VideoSessionStatus
}