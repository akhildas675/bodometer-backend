import {
    VideoSessionRefundStatus,
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
    trainerJoinedAt?: Date;
    userJoinedAt?: Date;
    actualStartTime?: Date;
    actualEndTime?: Date;
    actualDurationMinutes?: number;
    trainerLeftAt?: Date;
    userLeftAt?: Date;
    status: VideoSessionStatus;
    terminationReason?: VideoSessionTerminationReason;
    refundEligible?: boolean;
    refundStatus?: VideoSessionRefundStatus;
    refundId?: string;
    refundRequestedAt?: Date;
    refundProcessedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    // Populated fields for history view
    bookingNumber?: string;
    otherParticipantName?: string;
    otherParticipantEmail?: string;
    serviceName?: string;
    sessionPrice?: number;
}