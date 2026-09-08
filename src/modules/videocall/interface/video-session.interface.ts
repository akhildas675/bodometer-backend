import { VideoSessionStatus } from "../constant/video-session.constant"

export interface VideoSession{
  id:string,
  bookingId:string,
  trainerId:string,
  userId:string,
  scheduleStartTime:Date,
  scheduleEndTime:Date,
  trainerStartsRequestedAt?:Date,
  userAcceptedAt?:Date,
  trainerJoinedAt:Date,
  userJoinedAt?:Date,
  actualStartTime?:Date
  actualEndTime?:Date,

  trainerLeftAt?:Date,
  userLeftAt?:Date,

  status:VideoSessionStatus,
  terminationReason?:string,
  createdAt?:Date,
  updatedAt?:Date,

}