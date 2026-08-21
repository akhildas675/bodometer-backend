import {
  VideoSessionStatus,
  VideoSessionTerminationReason,
} from "../constant/video-session.constant";

export interface VideoSessionResponseDto {
  id: string;

  bookingId: string;

  trainerId: string;

  userId: string;

  scheduledStartTime: Date;

  scheduledEndTime: Date;

  trainerStartRequestedAt?: Date;

  userAcceptedAt?: Date;

  actualStartTime?: Date;

  actualEndTime?: Date;

  trainerJoinedAt?: Date;

  userJoinedAt?: Date;

  trainerLeftAt?: Date;

  userLeftAt?: Date;

  status: VideoSessionStatus;

  terminationReason?: VideoSessionTerminationReason;

  createdAt: Date;

  updatedAt: Date;
}